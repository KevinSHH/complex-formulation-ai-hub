# ComplexForm-AI Hub — 手把手部署上线指南

> 本指南假设你只有 GitHub 和 Hugging Face 两个账号，从未部署过网站。
> 每一步都有具体操作和预期结果。遇到问题先翻到文末「故障排查」。

**预计耗时**：首次 30–45 分钟（大部分是等平台构建）。
**全程费用**：0 元（GitHub 公开仓库 + HF Spaces 免费 CPU）。

---

## 整体流程一览

```
你的电脑                GitHub                    Hugging Face
─────────              ──────                    ────────────
项目代码  ──push──▶   代码仓库  ──Actions构建──▶   Space 上线运行
                        │
                        └─ 每日定时嗅探 ──▶ 自动更新文献数据
```

你只需要做两件事：**①把代码推上 GitHub；②在 HF 建一个 Space 并填一个 Token。** 其余全自动。

---

## 第 0 步：准备两个 Token（5 分钟）

### 0.1 Hugging Face Token（必需）

1. 打开 https://huggingface.co/settings/tokens （未登录会先要求登录）
2. 点 **「Create new token」**
3. 类型选 **「Write」**（必须能写，否则无法自动部署）
4. 名字随便填，如 `complexform-deploy`
5. 点创建，**复制那串以 `hf_` 开头的密钥**，粘贴到记事本备用。

### 0.2 LLM API Key（可选，用于每日智能摘要）

没有也能跑——系统会自动降级为规则抽取，网站照常更新，只是"主要发现/预测目标"等字段较简略。配置后摘要更专业。

**推荐：NVIDIA NIM（免费，无需信用卡）** —— 每日刷新的理想选择：

1. 打开 https://build.nvidia.com → 点 **「Login」** 注册（支持邮箱/Google/GitHub）
2. 验证邮箱；可选手机验证（+86 即可）提升免费额度
3. 点右上角头像 → **「API Keys」** → **「Generate API Key」**
4. 复制那串以 **`nvapi-`** 开头的密钥（只显示一次）
5. 配置时用：
   - `OPENAI_API_KEY` = `nvapi-...`（你复制的）
   - `OPENAI_API_BASE` = `https://integrate.api.nvidia.com/v1`
   - `OPENAI_MODEL` = `deepseek-ai/deepseek-v3.1`（或 `qwen/qwen2.5-72b-instruct`、`meta/llama-3.3-70b-instruct` 等免费模型）

> 免费额度限速 40 次/分钟，每日嗅探约 30 次调用，远低于上限，完全够用。

**其他可选服务商**（付费/便宜）：

| 服务商 | Base URL | 获取地址 |
|---|---|---|
| DeepSeek（便宜） | `https://api.deepseek.com/v1` | https://platform.deepseek.com/api_keys |
| OpenAI | `https://api.openai.com/v1` | https://platform.openai.com/api-keys |
| 火山方舟 Coding Plan | `https://ark.cn-beijing.volces.com/api/coding/v3` | 火山引擎控制台 |

同样复制备用。

---

## 第 1 步：把代码推上 GitHub（10 分钟）

### 1.1 新建仓库

1. 打开 https://github.com/new
2. **Repository name** 填：`complexform-ai-hub`
3. 选 **Public**（公开仓库 Actions 才无限免费；私有也可但分钟数有限）
4. **不要**勾选「Add a README」（避免与本地冲突）
5. 点 **「Create repository」**

### 1.2 推送本地代码

打开终端（Windows 用 Git Bash 或 PowerShell），逐行执行：

```bash
cd "D:/机器学习与复杂制剂/complexform-ai-hub"

# 初始化 git（若已是仓库会提示，可忽略）
git init

# 配置你的身份（换成你的 GitHub 用户名和邮箱）
git config user.name "你的GitHub用户名"
git config user.email "你的GitHub邮箱"

# 添加全部文件并提交
git add .
git commit -m "Initial commit: ComplexForm-AI Hub full stack"

# 关联远程仓库（把 USERNAME 换成你的 GitHub 用户名）
git branch -M main
git remote add origin https://github.com/USERNAME/complexform-ai-hub.git

# 推送
git push -u origin main
```

**预期结果**：终端显示 `* [new branch] main -> main`，刷新 GitHub 仓库页面能看到所有文件。

> 若 push 时要求登录，会弹出浏览器授权或使用 Personal Access Token 作为密码（不是账号密码）。获取 PAT：https://github.com/settings/tokens → Generate new token (classic) → 勾 `repo` 权限。

---

## 第 2 步：配置 GitHub Secrets（3 分钟）

让自动化流程能访问 HF 和 LLM。

1. 在你的仓库页面，点顶部 **「Settings」** → 左侧 **「Secrets and variables」** → **「Actions」**
2. 点 **「New repository secret」**，逐个添加：

| Name | Value | 必需？ |
|---|---|---|
| `HF_TOKEN` | 第 0.1 步复制的 `hf_...` | ✅ 必需 |
| `OPENAI_API_KEY` | 第 0.2 步的 key | 可选 |
| `OPENAI_API_BASE` | 第 0.2 步的 Base URL | 可选 |
| `OPENAI_MODEL` | 如 `deepseek-chat` 或 `gpt-4o-mini` | 可选 |
| `PUBMED_API_KEY` | NCBI key（提高限速） | 可选 |

3. 再点 **「Variables」** 标签 → **「New repository variable」** 添加：

| Name | Value | 说明 |
|---|---|---|
| `HF_SPACE_ID` | `你的HF用户名/complexform-ai-hub` | ✅ 必需，格式是 `用户名/Space名` |
| `OPENALEX_MAILTO` | 你的邮箱 | 进入 OpenAlex polite pool，更稳定 |

> ⚠️ `HF_SPACE_ID` 必须是 **`用户名/complexform-ai-hub`** 这种完整格式（带斜杠），不是单独的用户名。第 3 步建好 Space 后，可直接从浏览器地址栏复制 `huggingface.co/spaces/` 后面的部分。

---

## 第 3 步：创建 Hugging Face Space（5 分钟）

1. 打开 https://huggingface.co/new-space
2. **Space name** 填：`complexform-ai-hub`
3. **SDK** 选 **「Docker」** → 模板选 **「Blank」**（重要：不是 Gradio/Streamlit）
4. **Hardware** 保持 **「CPU basic · FREE」**
5. 可见性选 **Public**
6. 点 **「Create Space」**

创建后你会看到一个空仓库，地址形如 `https://huggingface.co/spaces/你的用户名/complexform-ai-hub`。

---

## 第 4 步：触发首次部署（2 分钟操作 + 10 分钟等待）

部署工作流 `deploy.yml` 已配置好，会在 `frontend/` 目录有变更时自动构建并推送到 HF。

### 方法一：手动触发（推荐首次使用）

1. GitHub 仓库页面 → 顶部 **「Actions」**
2. 若看到提示「Workflows aren't being run on this forked/…repository」，点 **「I understand my workflows, go ahead and enable them」**
3. 左侧选 **「Deploy to Hugging Face Spaces」**
4. 右侧点 **「Run workflow」** → 再点绿色 **「Run workflow」**
5. 刷新页面，点进运行中的任务可看实时日志。

**预期结果**：约 3–5 分钟后任务变绿色 ✓。随后 HF Space 会自动开始构建（HF 那边还需 5–10 分钟）。

### 方法二：推送一个改动自动触发

```bash
cd "D:/机器学习与复杂制剂/complexform-ai-hub"
git commit --allow-empty -m "Trigger initial deploy"
git push
```

---

## 第 5 步：验证上线

1. 打开你的 Space 地址：`https://huggingface.co/spaces/你的用户名/complexform-ai-hub`
2. 顶部 **「App」** 标签页（或直接访问 `https://你的用户名-complexform-ai-hub.hf.space`）
3. 首次构建时状态显示「Building」，等它变成「Running」。

**成功的标志**：
- 看到深色导航栏 + 「ComplexForm-AI Hub」标题
- 总览页显示 90 篇文献、4 个统计图表
- 顶部可切换到「文献库 / 分类体系 / 知识图谱」，数据都能加载

---

## 第 6 步：开启每日自动嗅探（无需操作，了解即可）

`sniff.yml` 已设定**每天 UTC 02:00（北京时间上午 10:00）自动运行**：

1. 调 OpenAlex + PubMed 检索 5 领域最新论文
2. 去重 → 规则抽取 →（有 key 时）LLM 结构化摘要
3. 更新 `data/papers.jsonl` 和前端 JSON
4. 自动 commit + push 回 GitHub 仓库
5. **把最新数据 JSON 直接推送到 HF Space 仓库的 `data/` 目录**——网站统计数据、图表、文献列表随之刷新（下次访问即生效）

> 说明：前端是把数据打包成静态文件部署的，所以必须把更新后的 JSON 同步进 Space 仓库，仅靠"重启 Space"无法刷新数据。这一步已在工作流里自动完成。

**全程零人工干预。** 你也可随时手动触发：Actions → 「Daily Paper Sniffer」→ Run workflow（可填回溯天数）。

---

## 故障排查

| 症状 | 原因 | 解决 |
|---|---|---|
| Actions 里看不到任何工作流 | 未启用 | Actions 页点「enable them」 |
| deploy 任务报 `HF_TOKEN` 错误 | Secret 没配或名字打错 | 检查 Settings → Secrets 拼写完全一致 |
| deploy 成功但 HF 一直 Building | HF 构建慢或日志报错 | HF Space 页 → 「Logs」看具体错误 |
| HF 报端口错误 | Dockerfile 端口不对 | 确认 `nginx.conf` 监听 7860（已配好） |
| 网站打开但无数据 | JSON 路径或 CORS | 打开浏览器 F12 → Console 看 fetch 报错 |
| 嗅探任务 LLM 步骤失败 | API key 无效/欠费 | 系统会自动降级规则抽取，不影响主流程 |
| Space 一段时间不用后打不开 | 免费版休眠 | 点「Restart」唤醒；每日部署会自动保持活跃 |

---

## 日常维护

| 你想做什么 | 怎么做 |
|---|---|
| 改检索关键词 | 编辑 `src/config.py` 的 `SEARCH_QUERIES`，push 即可 |
| 新增一个领域 | 在 `config.py` 的 `DOMAINS` 和 `SEARCH_QUERIES` 加条目 |
| 改前端样式 | 改 `frontend/src/` 下文件，push 后自动重新部署 |
| 立即更新文献 | Actions → Daily Paper Sniffer → Run workflow |
| 查看运行日志 | GitHub Actions 页 / HF Space Logs 页 |

---

**部署完成后，把 Space 链接分享给同行即可。**
