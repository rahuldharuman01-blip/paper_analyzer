"""Paperlens v2 - AI research paper analyzer and literature review assistant.

NLP pipeline : PDF -> text -> sections -> passages (chunks) with page numbers
Transformers : embedding model (Ollama nomic-embed-text, or sentence-transformers) for semantic search
LLM          : local model through Ollama (default mistral) for summaries, comparison and reviews
RAG          : retrieve the best passages (BM25 + embeddings, rank fusion) -> LLM answers with [n] citations
Everything still works without Ollama: keyword search and extractive answers take over.

Run:  python -m pip install -r requirements.txt && python app.py
"""
import csv, html, io, json, math, os, re, sqlite3, time, uuid, zipfile
from collections import Counter, defaultdict
from datetime import datetime
from xml.etree import ElementTree as ET

import requests
from flask import Flask, abort, jsonify, render_template, request, send_file
from pypdf import PdfReader

BASE = os.path.dirname(os.path.abspath(__file__))
PAPERS = os.path.join(BASE, "papers")
DB = os.path.join(BASE, "paperlens.db")
OLLAMA = os.environ.get("OLLAMA_URL", "http://localhost:11434")
MODEL = os.environ.get("OLLAMA_MODEL", "mistral")
EMBED_MODEL = os.environ.get("EMBED_MODEL", "nomic-embed-text")
CTX = int(os.environ.get("OLLAMA_CTX", "6144"))
UA = {"User-Agent": "Paperlens/2.0 (research paper analyzer)"}
MAX_PDF = 60 * 1024 * 1024
os.makedirs(PAPERS, exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_PDF


# ======================= database =======================
def db():
    c = sqlite3.connect(DB, timeout=30)
    c.row_factory = sqlite3.Row
    return c


def init():
    with db() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS papers(id TEXT PRIMARY KEY, title TEXT, authors TEXT, year TEXT, source TEXT,
            url TEXT, file TEXT, added TEXT, text TEXT, analysis TEXT);
        CREATE TABLE IF NOT EXISTS chunks(id INTEGER PRIMARY KEY AUTOINCREMENT, paper_id TEXT, idx INTEGER,
            page INTEGER, section TEXT, text TEXT, emb TEXT);
        CREATE INDEX IF NOT EXISTS ix_chunks_paper ON chunks(paper_id);
        CREATE TABLE IF NOT EXISTS chats(id INTEGER PRIMARY KEY AUTOINCREMENT, scope TEXT, question TEXT,
            answer TEXT, sources TEXT, mode TEXT, created TEXT);""")
        have = {r[1] for r in c.execute("PRAGMA table_info(papers)")}
        for col, typ in [("notes", "TEXT DEFAULT ''"), ("tags", "TEXT DEFAULT ''"), ("status", "TEXT DEFAULT 'to read'"),
                         ("starred", "INTEGER DEFAULT 0"), ("insights", "TEXT"), ("doi", "TEXT DEFAULT ''")]:
            if col not in have:
                c.execute(f"ALTER TABLE papers ADD COLUMN {col} {typ}")


init()


def out(r, full=False):
    d = {k: r[k] for k in ("id", "title", "authors", "year", "source", "url", "added", "status", "doi")}
    d["tags"] = [t for t in (r["tags"] or "").split(",") if t]
    d["starred"] = bool(r["starred"])
    a = json.loads(r["analysis"])
    if full:
        d["analysis"], d["notes"] = a, r["notes"] or ""
    else:
        d["analysis"] = {k: a[k] for k in ("pages", "words", "reading_minutes", "study_type", "reference_count")}
        d["analysis"]["keywords"] = a["keywords"][:10]
    return d


def get(pid):
    r = db().execute("SELECT * FROM papers WHERE id=?", (pid,)).fetchone()
    if not r:
        abort(404)
    return r


def slug(s):
    return re.sub(r"[^A-Za-z0-9]+", "_", s or "paper").strip("_")[:70] or "paper"


# ======================= NLP: analysis =======================
STOP = set("""a about above after again all also am an and any are as at be because been before being below between both but by
can could did do does doing down during each few for from further had has have having he her here hers him his how i if in into is
it its itself just may me might more most must my no nor not now of off on once only or other our out over own same she should so
some such than that the their them then there these they this those through to too under until up us very was we were what when
where which while who whom why will with would you your et al fig figure table using used use based also however thus therefore
paper study results show shown proposed propose approach method methods one two three first second new within among per via""".split())

SECTION_RE = re.compile(
    r"^(?:[IVX]+\.|\d+(?:\.\d+)*\.?)?\s*(abstract|introduction|related work|background|literature review|"
    r"methods?|methodology|materials and methods|experiments?|experimental setup|results|results and discussion|"
    r"discussion|limitations|conclusions?|future work|acknowledge?ments?|references|bibliography)\s*:?$", re.I)

STUDY_TYPES = {
    "Machine learning": "neural network training dataset accuracy model benchmark classifier deep learning",
    "Clinical or medical": "patients clinical trial treatment diagnosis cohort placebo mortality",
    "Survey or social science": "respondents survey questionnaire participants interview qualitative likert",
    "Literature review": "systematic review meta-analysis prisma literature search inclusion criteria",
    "Theoretical": "theorem lemma proof corollary proposition conjecture",
    "Engineering or physical": "experiment measured temperature voltage simulation sensor prototype",
}
CLAIM_RE = re.compile(r"\b(we (propose|present|introduce|show|demonstrate|find|develop)|this (paper|work|study) "
                      r"(proposes|presents|introduces|shows|demonstrates)|results (show|indicate|suggest)|"
                      r"outperform|state-of-the-art|our contributions?|we conclude)\b", re.I)
LIMIT_RE = re.compile(r"\b(limitation|limited to|future work|future research|remains? (a )?challenge|"
                      r"we leave|not (yet )?(address|consider)|caveat|shortcoming)\b", re.I)
REF_SECTIONS = ("References", "Bibliography")


def toks(s):
    return [w for w in re.findall(r"[a-z][a-z0-9-]{2,}", s.lower()) if w not in STOP]


def sents(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+(?=[A-Z])", re.sub(r"\s+", " ", text)) if s.strip()]


def syllables(w):
    w = w.lower()
    n = len(re.findall(r"[aeiouy]+", w))
    if w.endswith("e") and n > 1:
        n -= 1
    return max(n, 1)


def extract(path):
    r = PdfReader(path)
    text = "\n".join((p.extract_text() or "") for p in r.pages)
    text = re.sub(r"-\n(\w)", r"\1", text)
    meta = r.metadata
    return text, len(r.pages), ((meta.title or "") if meta else "").strip(), ((meta.author or "") if meta else "").strip()


def split_sections(text):
    marks, pos = [], 0
    for line in text.split("\n"):
        m = SECTION_RE.match(line.strip())
        if m and len(line.strip()) < 60:
            marks.append((m.group(1).lower(), pos))
        pos += len(line) + 1
    sections = {}
    for i, (name, start) in enumerate(marks):
        end = marks[i + 1][1] if i + 1 < len(marks) else len(text)
        body = text[start:end].split("\n", 1)[-1].strip()
        if len(body) > len(sections.get(name, "")):
            sections[name] = body
    return sections


def analyze(text, pages, meta_title="", meta_author=""):
    flat = re.sub(r"\s+", " ", text)
    words = re.findall(r"[A-Za-z][A-Za-z'-]+", flat)
    sections = split_sections(text)
    refs_text = sections.get("references") or sections.get("bibliography") or ""
    body = flat[: len(flat) - len(re.sub(r"\s+", " ", refs_text))] if refs_text else flat
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    title = meta_title if len(meta_title) > 8 else next((l for l in lines[:12] if 15 < len(l) < 200), "Untitled paper")
    abstract = sections.get("abstract", "")[:1800]
    ss = [s for s in sents(body) if 8 <= len(s.split()) <= 60]
    ss = [s for s in ss if sum(c.isdigit() for c in s) < len(s) * 0.15 and not re.match(r"(Fig|Table)", s)]
    lower = [w.lower() for w in words]
    freq = Counter(w for w in lower if len(w) > 3 and w not in STOP)
    bigrams = Counter(f"{a} {b}" for a, b in zip(lower, lower[1:])
                      if len(a) > 3 and len(b) > 3 and a not in STOP and b not in STOP)
    top = max(freq.values()) if freq else 1
    scored = []
    for i, s in enumerate(ss):
        ws = [w.lower() for w in re.findall(r"[A-Za-z]+", s)]
        scored.append((sum(freq.get(w, 0) / top for w in ws if w not in STOP) / (len(ws) ** 0.6), i, s))
    summary = [s for _, _, s in sorted(sorted(scored, reverse=True)[:5], key=lambda x: x[1])]
    refs = [r for r in re.split(r"\n(?=\[\d+\]|\d+\.\s)", refs_text) if len(r) > 25]
    sent_count = max(len(re.findall(r"[.!?]+(?:\s|$)", flat)), 1)
    wc = max(len(words), 1)
    flesch = 206.835 - 1.015 * (wc / sent_count) - 84.6 * (sum(syllables(w) for w in words[:5000]) / max(len(words[:5000]), 1))
    best, best_score = "General research", 0
    for label, terms in STUDY_TYPES.items():
        sc = sum(len(re.findall(r"\b%s" % t, flat, re.I)) for t in terms.split())
        if sc > best_score:
            best, best_score = label, sc
    if best_score < 6:
        best = "General research"
    years = Counter(re.findall(r"\b(?:19[5-9]\d|20[0-2]\d)\b", refs_text))
    return {
        "title": title, "author_guess": meta_author, "abstract": abstract, "summary": summary,
        "keywords": [{"term": w, "count": c} for w, c in freq.most_common(14)],
        "phrases": [{"term": w, "count": c} for w, c in bigrams.most_common(10) if c >= 3],
        "claims": [s for s in ss if CLAIM_RE.search(s)][:8], "limitations": [s for s in ss if LIMIT_RE.search(s)][:6],
        "pages": pages, "words": wc, "reading_minutes": max(round(wc / 200), 1),
        "readability": round(max(min(flesch, 100), 0), 1),
        "figures": len({m for m in re.findall(r"\bFig(?:ure|\.)\s*(\d+)", flat)}),
        "tables": len({m for m in re.findall(r"\bTable\s*(\d+)", flat)}),
        "reference_count": len(refs),
        "dois": sorted({d.rstrip(".,;)") for d in re.findall(r"10\.\d{4,9}/[^\s\"<>]+", text)})[:60],
        "reference_years": [{"year": y, "count": c} for y, c in sorted(years.items())],
        "sections": [{"name": k.title(), "words": len(v.split())} for k, v in sections.items()],
        "study_type": best,
    }


# ======================= transformers: embeddings and LLM =======================
_state = {"t": 0, "up": False, "llm": False, "emb": False}
_st_model = None
_vec = {}


class LLMDown(Exception):
    pass


def have(names, m):
    return any(n == m or n.split(":")[0] == m.split(":")[0] for n in names)


def ollama_up(force=False):
    if not force and time.time() - _state["t"] < 15:
        return _state
    _state["t"] = time.time()
    try:
        names = [m["name"] for m in requests.get(f"{OLLAMA}/api/tags", timeout=2).json().get("models", [])]
        _state.update(up=True, llm=have(names, MODEL), emb=have(names, EMBED_MODEL))
    except Exception:
        _state.update(up=False, llm=False, emb=False)
    return _state


def embedder_ready():
    return os.environ.get("EMBEDDER") == "st" or ollama_up()["emb"]


def norm(v):
    n = math.sqrt(sum(x * x for x in v)) or 1
    return [round(x / n, 4) for x in v]


def embed(texts, kind="doc"):
    """Return a list of unit vectors, or None when no embedding model is available."""
    global _st_model
    try:
        if os.environ.get("EMBEDDER") == "st":
            if _st_model is None:
                from sentence_transformers import SentenceTransformer
                _st_model = SentenceTransformer("all-MiniLM-L6-v2")
            return [norm(v.tolist()) for v in _st_model.encode(texts)]
        if not ollama_up()["emb"]:
            return None
        pre = ("search_query: " if kind == "query" else "search_document: ") if "nomic" in EMBED_MODEL else ""
        r = requests.post(f"{OLLAMA}/api/embed", json={"model": EMBED_MODEL, "input": [pre + t for t in texts]}, timeout=180)
        r.raise_for_status()
        return [norm(v) for v in r.json()["embeddings"]]
    except Exception:
        return None


def llm(prompt):
    s = ollama_up()
    if not s["up"]:
        raise LLMDown("The AI model is offline (Ollama is not running), so this answer uses keyword extraction only.")
    if not s["llm"]:
        raise LLMDown(f"The model '{MODEL}' is not installed. Run: ollama pull {MODEL}")
    try:
        r = requests.post(f"{OLLAMA}/api/generate", timeout=300, json={
            "model": MODEL, "prompt": prompt, "stream": False, "options": {"temperature": 0.2, "num_ctx": CTX}})
        r.raise_for_status()
        return r.json().get("response", "").strip()
    except Exception as e:
        raise LLMDown(f"The AI model did not respond ({e}).")


# ======================= RAG: chunking, indexing, retrieval =======================
def make_chunks(pages, size=170, keep=30):
    chunks, sec = [], "Front matter"
    for pn, pt in enumerate(pages, 1):
        buf, fresh, bsec = [], 0, sec
        for line in re.sub(r"-\n(\w)", r"\1", pt).split("\n"):
            m = SECTION_RE.match(line.strip())
            if m and len(line.strip()) < 60:
                if fresh >= 25:
                    chunks.append((pn, bsec, " ".join(buf)))
                buf, fresh = [], 0
                sec = bsec = m.group(1).title()
                continue
            if not buf:
                bsec = sec
            w = line.split()
            buf += w
            fresh += len(w)
            while len(buf) >= size:
                chunks.append((pn, bsec, " ".join(buf[:size])))
                buf = buf[size - keep:]
                fresh, bsec = max(len(buf) - keep, 0), sec
        if fresh >= 25:
            chunks.append((pn, bsec, " ".join(buf)))
    return chunks


def index_paper(pid, force=False):
    c = db()
    n = c.execute("SELECT COUNT(*) FROM chunks WHERE paper_id=?", (pid,)).fetchone()[0]
    if force or n == 0:
        r = c.execute("SELECT file FROM papers WHERE id=?", (pid,)).fetchone()
        if not r or not os.path.exists(r["file"]):
            return
        ch = make_chunks([(p.extract_text() or "") for p in PdfReader(r["file"]).pages])
        with c:
            c.execute("DELETE FROM chunks WHERE paper_id=?", (pid,))
            c.executemany("INSERT INTO chunks(paper_id,idx,page,section,text) VALUES(?,?,?,?,?)",
                          [(pid, i, p, s, t) for i, (p, s, t) in enumerate(ch)])
        _vec.clear()
    if embedder_ready():
        rows = c.execute("SELECT id,text FROM chunks WHERE paper_id=? AND emb IS NULL", (pid,)).fetchall()
        for i in range(0, len(rows), 24):
            b = rows[i:i + 24]
            v = embed([x["text"] for x in b], "doc")
            if not v:
                break
            with c:
                c.executemany("UPDATE chunks SET emb=? WHERE id=?", [(json.dumps(x), y["id"]) for x, y in zip(v, b)])
        _vec.clear()


def bm25(query, docs):
    q = set(toks(query))
    N = len(docs)
    avg = (sum(map(len, docs)) / N) if N else 1
    df = Counter()
    for d in docs:
        df.update(set(d) & q)
    res = []
    for d in docs:
        tf, s = Counter(d), 0.0
        for t in q:
            if t in tf:
                idf = math.log(1 + (N - df[t] + .5) / (df[t] + .5))
                s += idf * tf[t] * 2.5 / (tf[t] + 1.5 * (0.25 + 0.75 * len(d) / (avg or 1)))
        res.append(s)
    return res


def short(r):
    a = [x.strip() for x in re.split(r",| and |;", r["authors"] or "") if x.strip()]
    if not a:
        return " ".join(r["title"].split()[:4]) + "..."
    s = a[0].split()[-1]
    return f"{s} et al." if len(a) > 1 else s


def retrieve(q, ids=None, k=8, per_paper=4):
    """Hybrid retrieval: BM25 keyword ranking + embedding similarity, merged with reciprocal rank fusion."""
    c = db()
    if ids:
        ps = c.execute(f"SELECT id,title,authors,year FROM papers WHERE id IN ({','.join('?' * len(ids))})", list(ids)).fetchall()
    else:
        ps = c.execute("SELECT id,title,authors,year FROM papers").fetchall()
    meta = {p["id"]: p for p in ps}
    for pid in meta:
        index_paper(pid)
    if not meta:
        return []
    rows = c.execute(f"SELECT id,paper_id,page,section,text,emb FROM chunks WHERE paper_id IN ({','.join('?' * len(meta))}) "
                     f"AND section NOT IN ('References','Bibliography')", list(meta)).fetchall()
    if not rows:
        return []
    lex = bm25(q, [toks(r["text"]) for r in rows])
    rank = defaultdict(float)
    for pos, i in enumerate(sorted(range(len(rows)), key=lambda i: -lex[i])[:60]):
        if lex[i] > 0:
            rank[i] += 1 / (60 + pos)
    sem = False
    qv = embed([q], "query") if embedder_ready() else None
    if qv:
        qv = qv[0]
        sims = []
        for i, r in enumerate(rows):
            if r["emb"]:
                if r["id"] not in _vec:
                    _vec[r["id"]] = json.loads(r["emb"])
                v = _vec[r["id"]]
                if len(v) == len(qv):
                    sims.append((sum(x * y for x, y in zip(qv, v)), i))
        for pos, (s, i) in enumerate(sorted(sims, reverse=True)[:60]):
            rank[i] += 1 / (60 + pos)
            sem = True
    if not rank:
        return []
    ranked = sorted(rank, key=lambda i: -rank[i])
    top, cnt, hits = rank[ranked[0]], Counter(), []
    for i in ranked:
        r = rows[i]
        if cnt[r["paper_id"]] >= per_paper:
            continue
        cnt[r["paper_id"]] += 1
        p = meta[r["paper_id"]]
        hits.append({"chunk_id": r["id"], "paper_id": r["paper_id"], "title": p["title"], "label": f"{short(p)} {p['year'] or ''}".strip(),
                     "year": p["year"], "page": r["page"], "section": r["section"], "text": r["text"],
                     "score": round(rank[i] / top, 2), "semantic": sem})
        if len(hits) >= k:
            break
    return hits


class Src:
    """Numbers the passages used in a prompt so the answer can cite them as [n]."""
    def __init__(s):
        s.items, s.idx = [], {}

    def add(s, h):
        if h["chunk_id"] not in s.idx:
            s.items.append(dict(h, n=len(s.items) + 1))
            s.idx[h["chunk_id"]] = len(s.items)
        return s.idx[h["chunk_id"]]


def best_sentences(hits, cue, n=2):
    cue = set(toks(cue))
    cand = []
    for h in hits:
        for s in sents(h["text"]):
            w = s.split()
            if 7 <= len(w) <= 55 and sum(ch.isdigit() for ch in s) < len(s) * .15:
                cand.append((len(cue & set(toks(s))) / len(w) ** 0.3 + h["score"] * .5, s, h))
    cand.sort(key=lambda x: -x[0])
    res, seen = [], set()
    for _, s, h in cand:
        if s not in seen:
            seen.add(s)
            res.append((s, h))
        if len(res) == n:
            break
    return res


ASPECTS = {
    "Objective": "aim objective goal problem addressed motivation this paper proposes we propose",
    "Method": "method approach architecture algorithm model pipeline framework we use implemented",
    "Data": "dataset data collected samples participants corpus benchmark evaluated experiments",
    "Results": "results show achieved accuracy improvement outperforms findings demonstrate significant",
    "Limitations": "limitation future work however challenge remains constraint weakness",
}


def cited(text, n):
    return sorted({int(x) for x in re.findall(r"\[(\d{1,2})\]", text) if 1 <= int(x) <= n})


def answer(question, ids, k=8):
    hits = retrieve(question, ids, k)
    if not hits:
        return {"answer": "I could not find anything relevant. Add papers to the library or rephrase the question.",
                "sources": [], "mode": "none", "cited": [], "note": ""}
    S = Src()
    for h in hits:
        S.add(h)
    ctx = "\n\n".join(f"[{s['n']}] {s['label']}, page {s['page']}, {s['section']}:\n{s['text']}" for s in S.items)
    prompt = ("You are a careful research assistant. Answer using ONLY the numbered sources below. Cite every claim with the "
              "source number in square brackets, like [1] or [2][3]. If the sources do not contain the answer, say so plainly. "
              f"Be concise and precise.\n\nSources:\n{ctx}\n\nQuestion: {question}\n\nAnswer:")
    note = ""
    try:
        ans, mode = llm(prompt), "llm"
    except LLMDown as e:
        picks = best_sentences(S.items, question, 4)
        ans = "Most relevant passages from your papers:\n" + "\n".join(f"- {s} [{h['n']}]" for s, h in picks)
        mode, note = "extractive", str(e)
    return {"answer": ans, "sources": S.items, "mode": mode, "cited": cited(ans, len(S.items)), "note": note}


# ======================= citations =======================
def initials(parts):
    return " ".join(p[0].upper() + "." for p in parts)


def apa(r):
    names = [x.strip() for x in re.split(r",| and |;", r["authors"] or "") if x.strip()]
    fm = [f"{n.split()[-1]}, {initials(n.split()[:-1])}" if len(n.split()) > 1 else n for n in names[:6]]
    auth = ", ".join(fm) + (", et al." if len(names) > 6 else "") if fm else "Unknown author"
    tail = f" https://doi.org/{r['doi']}" if r["doi"] else (f" {r['url']}" if r["url"] else "")
    return f"{auth} ({r['year'] or 'n.d.'}). {r['title']}.{tail}"


def bibtex(r):
    names = [x.strip() for x in re.split(r",| and |;", r["authors"] or "") if x.strip()]
    key = re.sub(r"\W", "", (names[0].split()[-1] if names else "anon")) + (r["year"] or "") + re.sub(r"\W", "", r["title"].split()[0] if r["title"] else "")
    f = [f"  title = {{{r['title']}}}"]
    if names:
        f.append(f"  author = {{{' and '.join(names)}}}")
    if r["year"]:
        f.append(f"  year = {{{r['year']}}}")
    if r["doi"]:
        f.append(f"  doi = {{{r['doi']}}}")
    elif r["url"]:
        f.append(f"  url = {{{r['url']}}}")
    return "@article{" + key + ",\n" + ",\n".join(f) + "\n}"


def cite_text(rows, fmt):
    return "\n\n".join(bibtex(r) for r in rows) if fmt == "bibtex" else "\n\n".join(apa(r) for r in rows)


# ======================= ingest =======================
def ingest(path, meta=None):
    meta = meta or {}
    text, pages, mt, ma = extract(path)
    if len(text.strip()) < 200:
        raise ValueError("No readable text found. This looks like a scanned PDF; run OCR on it first.")
    a = analyze(text, pages, mt, ma)
    pid = uuid.uuid4().hex[:10]
    final = os.path.join(PAPERS, pid + ".pdf")
    os.replace(path, final)
    year = str(meta.get("year") or "")
    if not year:
        m = re.search(r"\b(19[89]\d|20[0-2]\d)\b", text[:3000])
        year = m.group(1) if m else ""
    doi = re.sub(r"^https?://(dx\.)?doi\.org/", "", meta.get("doi") or "")
    if not doi:
        m = re.search(r"10\.\d{4,9}/[^\s\"<>]+", text[:6000])
        doi = m.group(0).rstrip(".,;)") if m else ""
    with db() as c:
        c.execute("INSERT INTO papers(id,title,authors,year,source,url,file,added,text,analysis,doi) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                  (pid, meta.get("title") or a["title"], meta.get("authors") or ma, year, meta.get("source", "Uploaded"),
                   meta.get("url", ""), final, datetime.now().strftime("%Y-%m-%d %H:%M"), text, json.dumps(a), doi))
    try:
        index_paper(pid)
    except Exception:
        pass
    return out(get(pid))


def fetch_pdf(url):
    r = requests.get(url, headers=UA, timeout=60, stream=True, allow_redirects=True)
    r.raise_for_status()
    tmp = os.path.join(PAPERS, "tmp_" + uuid.uuid4().hex + ".pdf")
    size = 0
    with open(tmp, "wb") as f:
        for chunk in r.iter_content(65536):
            size += len(chunk)
            if size > MAX_PDF:
                f.close(); os.remove(tmp)
                raise ValueError("PDF is larger than 60 MB.")
            f.write(chunk)
    with open(tmp, "rb") as f:
        if f.read(5) != b"%PDF-":
            os.remove(tmp)
            raise ValueError("That link did not return a PDF (the publisher may require a login).")
    return tmp


# ======================= routes: library =======================
@app.route("/")
def index():
    return render_template("index.html")


@app.get("/api/papers")
def list_papers():
    return jsonify([out(r) for r in db().execute("SELECT * FROM papers ORDER BY added DESC").fetchall()])


@app.get("/api/papers/<pid>")
def paper(pid):
    return jsonify(out(get(pid), full=True))


@app.patch("/api/papers/<pid>")
def patch(pid):
    get(pid)
    d = request.get_json(force=True)
    sets, vals = [], []
    for k in ("notes", "status", "starred", "title", "authors", "year"):
        if k in d:
            sets.append(f"{k}=?")
            vals.append(int(bool(d[k])) if k == "starred" else str(d[k]))
    if "tags" in d:
        sets.append("tags=?")
        vals.append(",".join(sorted({t.strip() for t in d["tags"] if t.strip()})))
    if sets:
        with db() as c:
            c.execute(f"UPDATE papers SET {','.join(sets)} WHERE id=?", vals + [pid])
    return jsonify(out(get(pid)))


@app.post("/api/papers/bulk")
def bulk():
    """Bulk actions on many papers: status, star, tag, delete."""
    d = request.get_json(force=True)
    ids, act = d.get("ids") or [], d.get("action")
    if not ids or act not in ("status", "star", "unstar", "tag", "delete"):
        return jsonify(error="Choose papers and an action."), 400
    n = 0
    for pid in ids:
        r = db().execute("SELECT * FROM papers WHERE id=?", (pid,)).fetchone()
        if not r:
            continue
        with db() as c:
            if act == "status" and d.get("value") in ("to read", "reading", "done"):
                c.execute("UPDATE papers SET status=? WHERE id=?", (d["value"], pid))
            elif act in ("star", "unstar"):
                c.execute("UPDATE papers SET starred=? WHERE id=?", (int(act == "star"), pid))
            elif act == "tag" and str(d.get("value", "")).strip():
                tags = {t for t in (r["tags"] or "").split(",") if t} | {str(d["value"]).strip()}
                c.execute("UPDATE papers SET tags=? WHERE id=?", (",".join(sorted(tags)), pid))
            elif act == "delete":
                c.execute("DELETE FROM papers WHERE id=?", (pid,))
                c.execute("DELETE FROM chunks WHERE paper_id=?", (pid,))
                if os.path.exists(r["file"]):
                    os.remove(r["file"])
        n += 1
    if act == "delete":
        _vec.clear()
    return jsonify(ok=True, changed=n)


@app.post("/api/cite-selected")
def cite_selected():
    d = request.get_json(force=True)
    ids = d.get("ids") or []
    rows = [r for r in (db().execute("SELECT * FROM papers WHERE id=?", (i,)).fetchone() for i in ids) if r]
    return jsonify(text=cite_text(rows, d.get("fmt", "apa")), count=len(rows))


@app.get("/api/notes")
def all_notes():
    rows = db().execute("SELECT id,title,authors,year,notes FROM papers WHERE notes IS NOT NULL AND notes!='' ORDER BY added DESC").fetchall()
    return jsonify([dict(r) for r in rows])


@app.get("/api/library.csv")
def library_csv():
    cs = io.StringIO()
    w = csv.writer(cs)
    w.writerow(["title", "authors", "year", "source", "doi", "status", "tags", "pages", "words", "study_type"])
    for r in db().execute("SELECT * FROM papers ORDER BY added DESC").fetchall():
        a = json.loads(r["analysis"])
        w.writerow([r["title"], r["authors"], r["year"], r["source"], r["doi"], r["status"], r["tags"], a["pages"], a["words"], a["study_type"]])
    return send_file(io.BytesIO(cs.getvalue().encode("utf-8-sig")), as_attachment=True, mimetype="text/csv", download_name="paperlens_library.csv")


@app.delete("/api/papers/<pid>")
def delete(pid):
    r = get(pid)
    with db() as c:
        c.execute("DELETE FROM papers WHERE id=?", (pid,))
        c.execute("DELETE FROM chunks WHERE paper_id=?", (pid,))
    _vec.clear()
    if os.path.exists(r["file"]):
        os.remove(r["file"])
    return jsonify(ok=True)


@app.post("/api/upload")
def upload():
    files = request.files.getlist("files")
    if not files:
        return jsonify(error="Choose at least one PDF."), 400
    done, failed = [], []
    for f in files:
        tmp = os.path.join(PAPERS, "tmp_" + uuid.uuid4().hex + ".pdf")
        f.save(tmp)
        try:
            done.append(ingest(tmp))
        except Exception as e:
            failed.append({"name": f.filename, "error": str(e)})
            if os.path.exists(tmp):
                os.remove(tmp)
    return jsonify(added=done, failed=failed)


@app.post("/api/import")
def import_paper():
    d = request.get_json(force=True)
    if not d.get("pdf_url"):
        return jsonify(error="This paper has no open PDF link."), 400
    try:
        return jsonify(ingest(fetch_pdf(d["pdf_url"]), d))
    except Exception as e:
        return jsonify(error=str(e)), 400


@app.get("/api/papers/<pid>/download")
def download(pid):
    r = get(pid)
    return send_file(r["file"], as_attachment=True, download_name=f"{r['year'] or 'n.d.'}_{slug(r['title'])}.pdf")


@app.get("/api/papers/<pid>/pdf")
def pdf_inline(pid):
    return send_file(get(pid)["file"], mimetype="application/pdf")


def to_markdown(r):
    a = json.loads(r["analysis"])
    L = [f"# {r['title']}", f"*{r['authors'] or 'Unknown authors'}, {r['year'] or 'n.d.'}* ({r['source']})", "",
         f"**Type:** {a['study_type']}  |  **Pages:** {a['pages']}  |  **Words:** {a['words']}  |  "
         f"**Reading time:** {a['reading_minutes']} min  |  **References:** {a['reference_count']}", ""]
    if a["abstract"]:
        L += ["## Abstract", a["abstract"], ""]
    L += ["## Summary"] + [f"- {s}" for s in a["summary"]] + ["", "## Key claims"] + [f"- {s}" for s in a["claims"]]
    L += ["", "## Limitations and future work"] + [f"- {s}" for s in a["limitations"]]
    L += ["", "## Keywords", ", ".join(k["term"] for k in a["keywords"])]
    if r["insights"]:
        L += ["", "## Methods and findings", json.loads(r["insights"])["markdown"]]
    if r["notes"]:
        L += ["", "## My notes", r["notes"]]
    L += ["", "## Citation", apa(r)]
    return "\n".join(L)


@app.get("/api/papers/<pid>/export")
def export(pid):
    r = get(pid)
    if request.args.get("fmt") == "json":
        return send_file(io.BytesIO(json.dumps(out(r, full=True), indent=2).encode()), as_attachment=True,
                         download_name=slug(r["title"]) + ".json", mimetype="application/json")
    return send_file(io.BytesIO(to_markdown(r).encode()), as_attachment=True,
                     download_name=slug(r["title"]) + ".md", mimetype="text/markdown")


@app.get("/api/papers/<pid>/cite")
def cite(pid):
    return jsonify(text=cite_text([get(pid)], request.args.get("fmt", "apa")))


@app.get("/api/cite-all")
def cite_all():
    fmt = request.args.get("fmt", "bibtex")
    rows = db().execute("SELECT * FROM papers ORDER BY year, title").fetchall()
    return send_file(io.BytesIO(cite_text(rows, fmt).encode()), as_attachment=True, mimetype="text/plain",
                     download_name="references.bib" if fmt == "bibtex" else "references_apa.txt")


@app.get("/api/download-all")
def download_all():
    rows = db().execute("SELECT * FROM papers ORDER BY added").fetchall()
    if not rows:
        return jsonify(error="The library is empty."), 400
    buf, cs, used = io.BytesIO(), io.StringIO(), set()
    w = csv.writer(cs)
    w.writerow(["title", "authors", "year", "source", "doi", "url", "status", "tags", "pages", "words", "study_type", "keywords"])
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for r in rows:
            a = json.loads(r["analysis"])
            name = f"{r['year'] or 'n.d.'}_{slug(r['title'])}"
            if name in used:
                name += "_" + r["id"][:4]
            used.add(name)
            if os.path.exists(r["file"]):
                z.write(r["file"], f"papers/{name}.pdf")
            z.writestr(f"reports/{name}.md", to_markdown(r))
            w.writerow([r["title"], r["authors"], r["year"], r["source"], r["doi"], r["url"], r["status"], r["tags"],
                        a["pages"], a["words"], a["study_type"], "; ".join(k["term"] for k in a["keywords"][:8])])
        z.writestr("library.csv", cs.getvalue())
        z.writestr("references.bib", cite_text(rows, "bibtex"))
        z.writestr("references_apa.txt", cite_text(rows, "apa"))
    buf.seek(0)
    return send_file(buf, as_attachment=True, mimetype="application/zip", download_name=f"paperlens_library_{datetime.now():%Y%m%d}.zip")


# ======================= routes: AI features =======================
@app.get("/api/status")
def status():
    s, c = ollama_up(True), db()
    return jsonify(ollama=s["up"], llm=s["llm"], embed=embedder_ready(), model=MODEL, embed_model=EMBED_MODEL,
                   papers=c.execute("SELECT COUNT(*) FROM papers").fetchone()[0],
                   chunks=c.execute("SELECT COUNT(*) FROM chunks").fetchone()[0],
                   embedded=c.execute("SELECT COUNT(*) FROM chunks WHERE emb IS NOT NULL").fetchone()[0])


@app.post("/api/reindex")
def reindex():
    force = request.args.get("force") == "1"
    ollama_up(True)
    for r in db().execute("SELECT id FROM papers").fetchall():
        index_paper(r["id"], force)
    return status()


@app.post("/api/ask")
def ask():
    d = request.get_json(force=True)
    q = (d.get("question") or "").strip()
    if not q:
        return jsonify(error="Type a question first."), 400
    ids = d.get("ids") or []
    res = answer(q, ids)
    with db() as c:
        c.execute("INSERT INTO chats(scope,question,answer,sources,mode,created) VALUES(?,?,?,?,?,?)",
                  (",".join(ids), q, res["answer"], json.dumps(res["sources"]), res["mode"], datetime.now().strftime("%Y-%m-%d %H:%M")))
    return jsonify(res)


@app.post("/api/passages")
def passages():
    d = request.get_json(force=True)
    q = (d.get("question") or "").strip()
    if not q:
        return jsonify(error="Type something to search for."), 400
    hits = retrieve(q, d.get("ids") or [], k=12, per_paper=3)
    return jsonify(hits=[dict(h, n=i + 1) for i, h in enumerate(hits)], semantic=bool(hits and hits[0]["semantic"]))


@app.get("/api/chats")
def chats():
    rows = db().execute("SELECT * FROM chats ORDER BY id DESC LIMIT 12").fetchall()
    return jsonify([{"id": r["id"], "question": r["question"], "scope": r["scope"],
                     "res": {"answer": r["answer"], "sources": json.loads(r["sources"] or "[]"), "mode": r["mode"],
                             "cited": cited(r["answer"], 99), "note": ""}} for r in rows][::-1])


@app.delete("/api/chats")
def clear_chats():
    with db() as c:
        c.execute("DELETE FROM chats")
    return jsonify(ok=True)


def make_insights(pid):
    S = Src()
    per = {}
    for asp, cue in ASPECTS.items():
        per[asp] = retrieve(cue, [pid], k=3, per_paper=3)
    for asp in ASPECTS:
        for h in per[asp][:2]:
            S.add(h)
    if not S.items:
        return {"markdown": "No passages could be extracted from this paper.", "sources": [], "mode": "none"}
    ctx = "\n\n".join(f"[{s['n']}] page {s['page']}, {s['section']}:\n{s['text']}" for s in S.items)
    prompt = ("Using ONLY the numbered sources, write a structured summary of this research paper with these Markdown headings: "
              "## Objective, ## Method, ## Data, ## Key findings, ## Limitations. Under each heading write 2 or 3 concise bullet "
              "points and cite sources like [1]. If a heading is not covered, write '- Not stated in the retrieved text.'\n\n"
              f"Sources:\n{ctx}\n\nSummary:")
    try:
        return {"markdown": llm(prompt), "sources": S.items, "mode": "llm"}
    except LLMDown as e:
        lines = []
        for asp, cue in ASPECTS.items():
            lines.append(f"## {'Key findings' if asp == 'Results' else asp}")
            picks = best_sentences(per[asp], cue, 2)
            lines += [f"- {s} [{S.add(h)}]" for s, h in picks] or ["- Not found in the text."]
        return {"markdown": "\n".join(lines), "sources": S.items, "mode": "extractive", "note": str(e)}


@app.route("/api/papers/<pid>/insights", methods=["GET", "POST"])
def insights(pid):
    r = get(pid)
    if r["insights"] and request.method == "GET":
        return jsonify(json.loads(r["insights"]))
    res = make_insights(pid)
    if res["mode"] == "llm":
        with db() as c:
            c.execute("UPDATE papers SET insights=? WHERE id=?", (json.dumps(res), pid))
    return jsonify(res)


def lib_vectors(ids):
    """Paper-level vectors: mean embedding when available, else TF-IDF. Returns (vectors, mode)."""
    rows = db().execute("SELECT paper_id,text,emb FROM chunks WHERE section NOT IN ('References','Bibliography')").fetchall()
    docs, embs = defaultdict(Counter), defaultdict(list)
    for r in rows:
        docs[r["paper_id"]].update(toks(r["text"]))
        if r["emb"] and r["paper_id"] in ids:
            embs[r["paper_id"]].append(json.loads(r["emb"]))
    if ids and all(embs.get(i) for i in ids) and len({len(v[0]) for v in embs.values()}) == 1:
        return {i: norm([sum(x) / len(embs[i]) for x in zip(*embs[i])]) for i in ids}, "semantic"
    N, df = len(docs) or 1, Counter()
    for d in docs.values():
        df.update(d.keys())
    return {i: {t: (1 + math.log(f)) * math.log(1 + N / df[t]) for t, f in docs[i].items()} for i in ids}, "keyword"


def vcos(a, b):
    if isinstance(a, list):
        return sum(x * y for x, y in zip(a, b))
    den = math.sqrt(sum(v * v for v in a.values())) * math.sqrt(sum(v * v for v in b.values()))
    return sum(v * b.get(t, 0) for t, v in a.items()) / den if den else 0


@app.get("/api/papers/<pid>/related")
def related(pid):
    me = get(pid)
    rows = db().execute("SELECT * FROM papers").fetchall()
    ids = [r["id"] for r in rows]
    for i in ids:
        index_paper(i)
    vecs, mode = lib_vectors(ids)
    mk = {k["term"] for k in json.loads(me["analysis"])["keywords"]}
    res = []
    for r in rows:
        if r["id"] != pid:
            shared = sorted(mk & {k["term"] for k in json.loads(r["analysis"])["keywords"]})
            res.append({"id": r["id"], "title": r["title"], "year": r["year"], "authors": r["authors"],
                        "score": round(vcos(vecs[pid], vecs[r["id"]]), 3), "shared": shared[:6]})
    return jsonify(mode=mode, items=sorted(res, key=lambda x: -x["score"])[:6])


@app.post("/api/compare")
def compare():
    ids = (request.get_json(force=True).get("ids") or [])[:5]
    if len(ids) < 2:
        return jsonify(error="Choose at least two papers to compare."), 400
    rows = [get(i) for i in ids]
    an = [json.loads(r["analysis"]) for r in rows]
    S, grid = Src(), {a: {} for a in ASPECTS}
    for r in rows:
        for asp, cue in ASPECTS.items():
            picks = best_sentences(retrieve(cue, [r["id"]], k=3, per_paper=3), cue, 1)
            if picks:
                s, h = picks[0]
                grid[asp][r["id"]] = {"text": s, "n": S.add(h), "page": h["page"]}
    kw = [{k["term"] for k in a["keywords"]} for a in an]
    shared = sorted(set.intersection(*kw))
    unique = {r["id"]: sorted(kw[i] - set().union(*(kw[j] for j in range(len(rows)) if j != i)))[:8] for i, r in enumerate(rows)}
    vecs, mode = lib_vectors(ids)
    sim = [[round(vcos(vecs[a], vecs[b]), 2) for b in ids] for a in ids]
    papers = [dict(out(r), label=short(r)) for r in rows]
    ctx = "\n".join(f"[{c['n']}] {short(r)} {r['year']} - {asp}: {c['text']}" for asp in ASPECTS
                    for r in rows for c in [grid[asp].get(r["id"])] if c)
    prompt = ("Compare the research papers using ONLY the numbered notes below. Write Markdown with these headings: ## Overview "
              "(2 sentences), ## Key differences (bullets), ## Similarities (bullets), ## Strengths and weaknesses (one bullet per "
              "paper), ## Which to read first and why. Cite notes like [1] or [2][3]. Do not invent facts.\n\nNotes:\n" + ctx)
    ai, note, md = None, "", "extractive"
    try:
        ai, md = llm(prompt), "llm"
    except LLMDown as e:
        note = str(e)
    return jsonify(papers=papers, grid=grid, shared=shared, unique=unique, similarity=sim, sim_mode=mode,
                   ai=ai, mode=md, note=note, sources=S.items)


@app.post("/api/review")
def review():
    d = request.get_json(force=True)
    ids, topic = d.get("ids") or [], (d.get("topic") or "").strip() or "the selected papers"
    if len(ids) < 2:
        return jsonify(error="Choose at least two papers for a literature review."), 400
    rows = [get(i) for i in ids[:10]]
    notes, lim = [], []
    for n, r in enumerate(rows, 1):
        note = {}
        for asp in ("Objective", "Method", "Data", "Results", "Limitations"):
            p = best_sentences(retrieve(ASPECTS[asp], [r["id"]], k=3, per_paper=3), ASPECTS[asp], 1)
            if p:
                note[asp] = p[0][0]
        notes.append(note)
    ctx = "\n\n".join(f"[{n}] {short(r)} ({r['year'] or 'n.d.'}), {r['title']}\n" + "\n".join(f"{k}: {v}" for k, v in nt.items())
                      for n, (r, nt) in enumerate(zip(rows, notes), 1))
    refs = "\n\n## References\n" + "\n".join(f"{n}. {apa(r)}" for n, r in enumerate(rows, 1))
    prompt = (f"Write a literature review on the topic '{topic}' in formal academic prose (600 to 900 words). Use ONLY the notes below. "
              "Cite papers by their number in square brackets, like [1] or [2][3]. Use these Markdown headings: ## Introduction, "
              "## Thematic analysis (group the studies by theme), ## Methodological comparison, ## Gaps and future directions, "
              "## Conclusion. Do not invent facts and do not write a reference list.\n\nNotes:\n" + ctx)
    try:
        return jsonify(markdown=f"# Literature review: {topic}\n\n" + llm(prompt) + refs, mode="llm")
    except LLMDown as e:
        kw = Counter(t for r in rows for t in {k["term"] for k in json.loads(r["analysis"])["keywords"]})
        common = [t for t, c in kw.most_common(12) if c >= 2][:8]
        md = [f"# Literature review: {topic}", "", "## Introduction",
              f"This review summarizes {len(rows)} papers on {topic}, drawing on the passages most relevant to each paper's "
              f"objective, method, data, results and limitations. {'Recurring themes across the papers include ' + ', '.join(common) + '.' if common else ''}",
              "", "## Summary of studies"]
        for n, (r, nt) in enumerate(zip(rows, notes), 1):
            md.append(f"**{short(r)} ({r['year'] or 'n.d.'})** [{n}]. " + " ".join(nt.get(a, "") for a in ("Objective", "Method", "Data", "Results")).strip())
            md.append("")
        md += ["## Gaps and limitations"] + [f"- {short(r)} [{n}]: {nt['Limitations']}" for n, (r, nt) in enumerate(zip(rows, notes), 1) if nt.get("Limitations")]
        md += ["", "## Conclusion", f"Together these studies show how {topic} is being approached. Compare their methods and limitations above "
               "to decide where further work is needed. (Draft built without the AI model; start Ollama for a fully written review.)"]
        return jsonify(markdown="\n".join(md) + refs, mode="extractive", note=str(e))


def md_html(md):
    out_, ul = [], False
    for line in md.split("\n"):
        e = html.escape(line)
        e = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", e)
        m = re.match(r"^(#{1,3})\s+(.*)", e)
        li = re.match(r"^\s*(?:[-*]|\d+\.)\s+(.*)", e)
        if ul and not li:
            out_.append("</ul>")
            ul = False
        if m:
            out_.append(f"<h{len(m.group(1))}>{m.group(2)}</h{len(m.group(1))}>")
        elif li:
            if not ul:
                out_.append("<ul>")
                ul = True
            out_.append(f"<li>{li.group(1)}</li>")
        elif e.strip():
            out_.append(f"<p>{e}</p>")
    return "".join(out_) + ("</ul>" if ul else "")


@app.post("/api/export-doc")
def export_doc():
    d = request.get_json(force=True)
    md, name = d.get("markdown", ""), slug(d.get("title") or "literature_review")
    if d.get("fmt") == "doc":
        page = ("<html><head><meta charset='utf-8'><style>body{font-family:'Times New Roman';font-size:12pt;line-height:1.5}"
                "h1{font-size:20pt}h2{font-size:15pt}</style></head><body>" + md_html(md) + "</body></html>")
        return send_file(io.BytesIO(page.encode()), as_attachment=True, download_name=name + ".doc", mimetype="application/msword")
    return send_file(io.BytesIO(md.encode()), as_attachment=True, download_name=name + ".md", mimetype="text/markdown")


# ======================= routes: discover =======================
def search_arxiv(q, n):
    r = requests.get("http://export.arxiv.org/api/query", headers=UA, timeout=30,
                     params={"search_query": f"all:{q}", "start": 0, "max_results": n, "sortBy": "relevance"})
    r.raise_for_status()
    ns, res = {"a": "http://www.w3.org/2005/Atom"}, []
    for e in ET.fromstring(r.text).findall("a:entry", ns):
        pdf = next((l.get("href") for l in e.findall("a:link", ns) if l.get("title") == "pdf"), "")
        res.append({"title": " ".join(e.findtext("a:title", "", ns).split()),
                    "authors": ", ".join(a.findtext("a:name", "", ns) for a in e.findall("a:author", ns)),
                    "year": e.findtext("a:published", "", ns)[:4], "abstract": " ".join(e.findtext("a:summary", "", ns).split()),
                    "pdf_url": pdf.replace("http://", "https://"), "url": e.findtext("a:id", "", ns), "source": "arXiv"})
    return res


def search_openalex(q, n):
    r = requests.get("https://api.openalex.org/works", headers=UA, timeout=30,
                     params={"search": q, "per-page": n, "filter": "open_access.is_oa:true"})
    r.raise_for_status()
    res = []
    for w in r.json().get("results", []):
        loc = w.get("best_oa_location") or {}
        inv = w.get("abstract_inverted_index") or {}
        ab = " ".join(k for _, k in sorted((p, word) for word, ps in inv.items() for p in ps))
        res.append({"title": w.get("title") or "Untitled", "year": w.get("publication_year") or "",
                    "authors": ", ".join(a["author"]["display_name"] for a in w.get("authorships", [])[:6]),
                    "abstract": ab[:900], "pdf_url": loc.get("pdf_url") or "", "cited_by": w.get("cited_by_count", 0),
                    "doi": w.get("doi") or "", "url": (w.get("primary_location") or {}).get("landing_page_url") or w.get("doi") or "",
                    "source": "OpenAlex"})
    return res


@app.get("/api/search")
def search():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify(error="Enter a topic or title."), 400
    try:
        return jsonify((search_openalex if request.args.get("source") == "openalex" else search_arxiv)(q, 15))
    except Exception as e:
        return jsonify(error=f"Search failed. Check your internet connection. ({e})"), 502


if __name__ == "__main__":
    app.run(debug=True, port=5000)
