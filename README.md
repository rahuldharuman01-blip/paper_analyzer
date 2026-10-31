# Paperlens - AI research paper analyzer and literature review assistant

## Run (Windows PowerShell)
```
python -m pip install -r requirements.txt
python app.py
```
Open http://127.0.0.1:5000

## Turn on the AI features (optional, free, runs on your PC)
Install Ollama, then:
```
ollama pull mistral
ollama pull nomic-embed-text
```
Without Ollama everything still works in keyword mode (no AI-written text).
Settings (optional): OLLAMA_MODEL, EMBED_MODEL, OLLAMA_CTX, EMBEDDER=st (use sentence-transformers instead).

## How it maps to the project concepts
| Concept | Where it is used |
|---|---|
| NLP | PDF text extraction, section detection, sentence splitting, keywords, TF-IDF, BM25, readability |
| Transformers | Embedding model (nomic-embed-text) turns passages and questions into vectors |
| Semantic search | Hybrid search: BM25 keywords + embedding similarity merged by reciprocal rank fusion |
| LLMs | Local Mistral writes summaries, comparisons and literature reviews |
| Text summarization | Extractive summary (offline) and AI methods/findings summary with citations |
| RAG | Ask your papers: retrieve best passages, give them to the LLM, answer with [n] citations to paper and page |

## Features
- Upload PDFs or import free PDFs from arXiv and OpenAlex (single or bulk)
- Ask your papers: cited answers, click a citation to see the passage, open the PDF at that page
- Find passages: semantic search across the library
- Methods and findings summary per paper, cached after the first run
- Compare 2 to 5 papers: similarity matrix, side-by-side objective/method/data/results/limitations, shared topics, AI comparison
- Literature review writer: choose papers and a topic, copy it or download it for Word (.doc) or Markdown
- Citations: copy APA or BibTeX, export all references
- Library: tags, notes, star, reading status, filters, related papers
- Download all papers as one ZIP (PDFs, a report per paper, library.csv, references.bib)
- Light and dark theme

## What's new in the redesign (v3 interface)
- New professional theme: ink-indigo sidebar, gold highlighter accents, serif reading type. Light, dark and auto modes.
- Appearance drawer: 6 accent colours, text size slider, comfortable or compact density
- Command palette (Ctrl+K or /): jump anywhere, search papers, run actions, or ask a question directly
- Keyboard shortcuts: g h / g l / g a / g u / g b / g m / g c to navigate, t for theme, ? for help
- Dashboard: greeting, reading-progress donut, papers by year, study types, topic cloud, recently added, recently opened
- Library: grid or list layout, tag filter bar, study-type filter, 6 sort options, bulk actions (status, star, tag, delete, ask, compare, review, cite)
- Reading board: drag and drop papers between To read, Reading and Done
- Knowledge map: force-directed network of papers (shared topics) or topics (co-occurrence)
- Ask: suggested questions, copy answer, save answer to notes, export the conversation as Markdown
- Citation manager: APA or BibTeX for any selection
- Notes hub: every note across your papers, searchable, exportable; auto-save in each paper
- Paper page: readability gauge, one-click "add to notes" on claims and limitations, copy summary
- Compare: copy the comparison as a Markdown table
- Find papers: recent searches, marks papers already in your library
- How it works: live status for NLP, Transformers, Semantic search, LLMs, Summarization and RAG
- New API endpoints: POST /api/papers/bulk, POST /api/cite-selected, GET /api/notes, GET /api/library.csv
