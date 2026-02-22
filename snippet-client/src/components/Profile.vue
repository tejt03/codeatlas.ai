<template>
  <div class="page" @click="closeProfileMenu">
    <!-- Top bar -->
    <header class="topbar">
      <div class="brand">
        <div class="brandTitle">CodeAtlas AI</div>
        <div class="brandSub">Store, bookmark, and understand code snippets</div>
      </div>

      <div class="profileArea" @click.stop>
        <button class="profileBtn" @click="toggleProfileMenu" aria-label="Open profile menu">
          <img :src="pic" class="avatar" alt="profile avatar" />

          <div class="profileInfo">
            <div class="profileNameRow">
              <div class="profileName">{{ user.username }}</div>
            </div>

            <div class="meta">
              <span class="metaItem">
                <i class="far fa-envelope"></i>
                {{ user.years_experience }} yrs
              </span>
              <span class="metaItem">
                <i class="fas fa-graduation-cap"></i>
                {{ (user.programming_languages || []).length }} langs
              </span>
            </div>
          </div>
        </button>

        <div v-if="showProfileMenu" class="menu">
          <button class="menuItem danger" @click="logout">
            <span class="menuIcon">⎋</span>
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main layout -->
    <main class="layout">
      <!-- Left column -->
      <section class="col left">
        <!-- Languages -->
        <div class="card">
          <div class="cardHeader">
            <h2 class="h2">Programming Languages</h2>
            <span class="subtle">{{ (user.programming_languages || []).length }} total</span>
          </div>

          <div class="chipGrid">
            <span v-for="pl in (user.programming_languages || [])" :key="pl" class="chip">
              {{ pl }}
            </span>
          </div>
        </div>

        <!-- Bookmarks -->
        <div class="card">
          <div class="cardHeader">
            <h2 class="h2">Bookmarks</h2>
            <span class="subtle">{{ bookmarkSnippets.length }} saved</span>
          </div>

          <div v-if="!bookmarkSnippets.length" class="empty">
            No bookmarks yet. Bookmark a snippet to save it here.
          </div>

          <div v-else class="list">
            <div
              v-for="s in bookmarkSnippets"
              :key="s._id"
              class="listRow bookmarkRow"
              role="button"
              tabindex="0"
              @click="openBookmarkModal(s)"
              @keydown.enter="openBookmarkModal(s)"
              @keydown.space.prevent="openBookmarkModal(s)"
            >
              <div class="listRowMain">
                <div class="rowTitle">
                  {{ s.title }}
                  <span class="rowSubtle">({{ s.programming_language }})</span>
                </div>
                <div class="rowSubtle">Tap to view</div>
              </div>

              <button class="ghostBtn smallBtn" title="Remove bookmark" @click.stop="toggleBookmark(s)" type="button">
                Remove
              </button>
            </div>
          </div>
        </div>
      </section>

  
      <section class="col right">
        <div v-if="showAddForm" class="card elevated">
          <div class="cardHeader">
            <h2 class="h2">Add Snippet</h2>
            <button class="iconBtn" @click="cancelAdd" aria-label="Close">✕</button>
          </div>

          <div class="form">
            <div class="field">
              <label>Title</label>
              <input v-model.trim="newSnippet.title" type="text" placeholder="e.g. Two Sum" />
            </div>

            <div class="field">
              <label>Programming Language</label>
              <input v-model.trim="newSnippet.programming_language" type="text" placeholder="e.g. Python" />
            </div>

            <div class="field">
              <label>Code</label>
              <textarea v-model="newSnippet.code_snippet" rows="7" placeholder="Paste code here..."></textarea>
            </div>

            <div v-if="addError" class="inlineError">{{ addError }}</div>

            <div class="formActions">
              <button class="primaryBtn smallBtn" @click="submitSnippet" :disabled="addingSnippet">
                {{ addingSnippet ? "Saving..." : "Save Snippet" }}
              </button>
              <button class="secondaryBtn smallBtn" @click="cancelAdd" :disabled="addingSnippet">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Snippets -->
        <div class="card">
          <div class="cardHeader">
            <h2 class="h2">Snippets</h2>
            <div class="headerRightInline">
              <span class="subtle">{{ visibleSnippets.length }} items</span>
              <button class="primaryBtn small" @click="openAddForm">
                <span class="btnIcon">＋</span>
                Add Snippet
              </button>
            </div>
          </div>

          <div v-if="!visibleSnippets.length" class="empty">
            No snippets yet. Add one to get started.
          </div>

          <div v-else class="snippetGrid">
            <article v-for="s in visibleSnippets" :key="s._id" class="snippetCard">
              <div class="snippetTop">
                <div class="snippetTitles">
                  <div class="snippetTitle">{{ s.title }}</div>
                  <div class="snippetMeta">{{ s.programming_language }}</div>
                </div>

                <div class="snippetTopRight">
                  <button
                    class="starBtn"
                    :class="{ active: isBookmarked(s._id) }"
                    :title="isBookmarked(s._id) ? 'Bookmarked' : 'Not bookmarked'"
                    type="button"
                    @click="toggleBookmark(s)"
                    :disabled="!!bookmarkLoading[s._id]"
                    aria-label="Toggle bookmark"
                  >
                    ★
                  </button>

                  <button
                    class="closeBtn"
                    title="Close snippet"
                    type="button"
                    @click="closeSnippet(s)"
                    aria-label="Close snippet"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <pre class="codeBlock" v-if="s.code_snippet"><code>{{ s.code_snippet }}</code></pre>

              <div class="snippetActions">
                <button
                  class="secondaryBtn smallBtn"
                  @click="toggleBookmark(s)"
                  :disabled="!!bookmarkLoading[s._id]"
                >
                  {{
                    bookmarkLoading[s._id]
                      ? "Updating..."
                      : isBookmarked(s._id)
                      ? "Remove Bookmark"
                      : "Bookmark"
                  }}
                </button>

                <button
                  class="primaryBtn smallBtn"
                  @click="explainSnippet(s)"
                  :disabled="!!loadingExplain[s._id]"
                >
                  {{ loadingExplain[s._id] ? "Generating..." : "Explain Code" }}
                </button>
              </div>

              <div v-if="bookmarkError[s._id]" class="inlineError">
                {{ bookmarkError[s._id] }}
              </div>

              <div v-if="explainError[s._id]" class="inlineError">
                {{ explainError[s._id] }}
              </div>

              <div v-if="explanations[s._id]" class="explainBox">
                <div class="explainHeader">Explanation</div>
                <p class="explainText">{{ explanations[s._id] }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>

    <div v-if="bookmarkModal.open" class="modalOverlay" @click="closeBookmarkModal">
    <div class="modal" @click.stop>
        <div class="modalHeader">
        <div class="modalTitle">
            <div class="modalTitleMain">{{ bookmarkModal.snippet?.title }}</div>
            <div class="modalTitleSub">{{ bookmarkModal.snippet?.programming_language }}</div>
        </div>

        <div class="modalHeaderRight">
            <button
            class="starBtn"
            :class="{ active: bookmarkModal.snippet && isBookmarked(bookmarkModal.snippet._id) }"
            type="button"
            @click="bookmarkModal.snippet && toggleBookmark(bookmarkModal.snippet)"
            aria-label="Toggle bookmark"
            >
            ★
            </button>
            <button class="closeBtn" type="button" @click="closeBookmarkModal" aria-label="Close modal">
            ✕
            </button>
        </div>
        </div>

 
        <div class="modalBody">
        <div class="modalLeft">
            <div class="modalCodeWrap">
            <pre class="codeBlock modalCode" v-if="bookmarkModal.snippet?.code_snippet">
    <code>{{ bookmarkModal.snippet.code_snippet }}</code>
            </pre>
            </div>

            <div class="modalActions">
            <button
                class="primaryBtn"
                type="button"
                :disabled="bookmarkModal.snippet ? !!loadingExplain[bookmarkModal.snippet._id] : true"
                @click="bookmarkModal.snippet && explainSnippet(bookmarkModal.snippet)"
            >
                {{
                bookmarkModal.snippet && loadingExplain[bookmarkModal.snippet._id]
                    ? "Generating..."
                    : "Explain Code"
                }}
            </button>
            <button class="secondaryBtn" type="button" @click="closeBookmarkModal">Close</button>
            </div>
        </div>


        <div class="modalRight">
            <div v-if="bookmarkModal.snippet && explainError[bookmarkModal.snippet._id]" class="inlineError">
            {{ explainError[bookmarkModal.snippet._id] }}
            </div>

            <div v-if="bookmarkModal.snippet && explanations[bookmarkModal.snippet._id]" class="explainBox">
            <div class="explainHeader">Explanation</div>
            <p class="explainText">{{ explanations[bookmarkModal.snippet._id] }}</p>
            </div>

            <div v-else class="empty">
            Generate an explanation to view it here.
            </div>
        </div>
    </div>
    </div>
</div>
</div>
 </template>

<script>
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default {
  data() {
    return {
      user: {},
      pic: "",

      // profile menu
      showProfileMenu: false,

      // Add snippet
      showAddForm: false,
      addingSnippet: false,
      addError: "",
      newSnippet: {
        title: "",
        programming_language: "",
        code_snippet: "",
      },

      // Explain
      explanations: {},
      loadingExplain: {},
      explainError: {},

      // Bookmarks
      bookmarkLoading: {},
      bookmarkError: {},

      // UI state
      hiddenSnippetIds: new Set(),

      // Bookmark modal
      bookmarkModal: {
        open: false,
        snippet: null,
      },
    };
  },

  computed: {
    visibleSnippets() {
      const snippets = this.user.snippets || [];
      return snippets.filter((s) => !this.hiddenSnippetIds.has(s._id));
    },

    bookmarkSnippets() {
      const snippets = this.user.snippets || [];
      const bookmarks = this.user.bookmarks || [];

      const ids = bookmarks
        .map((b) => (typeof b.snippet_id === "string" ? b.snippet_id : b.snippet_id?._id))
        .filter(Boolean);

      const idSet = new Set(ids);
      return snippets.filter((s) => idSet.has(s._id));
    },
  },

  async created() {
    await this.fetchUser();
  },

  methods: {
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
    },
    closeProfileMenu() {
      this.showProfileMenu = false;
    },
    logout() {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      this.showProfileMenu = false;
      this.$router.push("/login");
    },

    async fetchUser() {
      const { id } = this.$route.params;
      const response = await axios.get(
        `${API_BASE_URL}/users/${id}?snippets=true&bookmarks=true`
      );

      this.user = response.data;
      this.pic = `https://api.dicebear.com/7.x/initials/svg?seed=${this.user.username}+&backgroundColor=27b8c7`;
    },

    openAddForm() {
      this.addError = "";
      this.showAddForm = true;
      this.$nextTick(() => {
        const el = document.querySelector(".elevated");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },

    cancelAdd() {
      this.addError = "";
      this.showAddForm = false;
      this.newSnippet = { title: "", programming_language: "", code_snippet: "" };
    },

    async submitSnippet() {
      this.addError = "";

      if (!this.newSnippet.title || !this.newSnippet.programming_language || !this.newSnippet.code_snippet) {
        this.addError = "Please fill in title, programming language, and code.";
        return;
      }

      this.addingSnippet = true;

      try {
        const token = localStorage.getItem("authToken");

        const payload = {
          title: this.newSnippet.title,
          programming_language: this.newSnippet.programming_language,
          code_snippet: this.newSnippet.code_snippet,
          user_id: this.user._id,
        };

        await axios.post(`${API_BASE_URL}/snippets`, payload, {
          headers: token ? { Authorization: token } : {},
        });

        await this.fetchUser();
        this.cancelAdd();
      } catch (error) {
        this.addError = error.response?.data?.error || "Failed to create snippet.";
      } finally {
        this.addingSnippet = false;
      }
    },

    // --- bookmarks ---
    getBookmarkForSnippet(snippetId) {
      const bookmarks = this.user.bookmarks || [];
      return bookmarks.find((b) => {
        const sid = typeof b.snippet_id === "string" ? b.snippet_id : b.snippet_id?._id;
        return sid === snippetId;
      });
    },

    isBookmarked(snippetId) {
      return !!this.getBookmarkForSnippet(snippetId);
    },

    async toggleBookmark(snippet) {
      const snippetId = snippet._id;
      this.bookmarkLoading[snippetId] = true;
      this.bookmarkError[snippetId] = "";

      try {
        const existing = this.getBookmarkForSnippet(snippetId);

        if (existing) {
          await axios.delete(`${API_BASE_URL}/bookmarks/${existing._id}`);
        } else {
          await axios.post(`${API_BASE_URL}/bookmarks`, {
            user_id: this.user._id,
            snippet_id: snippetId,
          });
        }

        await this.fetchUser();
      } catch (err) {
        this.bookmarkError[snippetId] =
          err.response?.data?.error || "Failed to update bookmark.";
      } finally {
        this.bookmarkLoading[snippetId] = false;
      }
    },


    async closeSnippet(snippet) {
      const id = snippet._id;

      this.hiddenSnippetIds.add(id);
      if (this.isBookmarked(id)) return;
      try {
        await axios.delete(`${API_BASE_URL}/snippets/${id}`);
        await this.fetchUser();
      } catch {
        // restore on failure
        this.hiddenSnippetIds.delete(id);
      }
    },

    // --- bookmark modal ---
    openBookmarkModal(snippet) {
      this.bookmarkModal.snippet = snippet;
      this.bookmarkModal.open = true;
    },
    closeBookmarkModal() {
      this.bookmarkModal.open = false;
      this.bookmarkModal.snippet = null;
    },

    // --- explain ---
    sanitizeExplanation(text) {
      if (!text) return "";
      return text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`{1,3}/g, "")
        .trim();
    },

    async explainSnippet(snippet) {
      const id = snippet._id;

      this.loadingExplain[id] = true;
      this.explainError[id] = "";
      this.explanations[id] = "";

      try {
        const code = (snippet.code_snippet || "").trim();
        if (!code) {
          this.explainError[id] = "No code found for this snippet.";
          return;
        }

        const res = await axios.post(`${API_BASE_URL}/snippets/explain`, { code });
        this.explanations[id] = this.sanitizeExplanation(res.data.explanation);
      } catch (err) {
        this.explainError[id] = err.response?.data?.error || "Failed to generate explanation.";
      } finally {
        this.loadingExplain[id] = false;
      }
    },
  },
};
</script>

<style scoped>
/* Base */
.page {
  min-height: 100vh;
  padding: 26px;
  background:
    radial-gradient(900px 420px at 10% 10%, rgba(39, 184, 199, 0.10), transparent 60%),
    radial-gradient(820px 420px at 92% 12%, rgba(215, 168, 195, 0.08), transparent 60%),
    linear-gradient(180deg, #f7f8fb 0%, #f4f6fa 40%, #eef1f7 100%);
  color: #0f172a;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
}

/* Topbar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 55px rgba(15, 23, 42, 0.10);
  margin-bottom: 18px;
}

.brandTitle {
  font-size: 30px;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: rgba(39, 184, 199, 0.98);
}

.brandSub {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.60);
}

/* Section titles */
.h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: rgba(39, 184, 199, 0.98);
}

/* Profile area (right) */
.profileArea {
  position: relative;
}

.profileBtn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.08);
  cursor: pointer;
  transition: transform 140ms ease, background 140ms ease, border-color 140ms ease;
}

.profileBtn:hover {
  transform: translateY(-1px);
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(15, 23, 42, 0.12);
}

.avatar {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgba(39, 184, 199, 0.14);
  border: 1px solid rgba(39, 184, 199, 0.25);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.profileInfo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.profileNameRow {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profileName {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.metaItem {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.70);
}

.metaItem i {
  color: rgba(39, 184, 199, 1);
}

/* Dropdown menu */
.menu {
  position: absolute;
  right: 0;
  top: calc(85% + 10px);
  width: 150px;
  height: 60px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.10);
  box-shadow: 0 18px 55px rgba(15, 23, 42, 0.14);
  padding: 8px;
  z-index: 10;
}

.menuItem {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: px 30px;
  border-radius: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 900;
  letter-spacing: 0.2px;
  font-size: 15px;
  color: rgba(15, 23, 42, 0.85);
  transition: background 140ms ease, transform 140ms ease;
}

.menuItem:hover {
  background: rgba(15, 23, 42, 0.05);
  transform: translateY(-1px);
}

.menuItem.danger {
  color: rgba(155, 28, 28, 0.95);
}

.menuIcon {
  font-size: 13px;
}

/* Layout */
.layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 18px;
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.col {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Cards */
.card {
  border-radius: 18px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 16px 46px rgba(15, 23, 42, 0.08);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.card:hover {
  transform: translateY(-2px);
  border-color: rgba(15, 23, 42, 0.12);
  box-shadow: 0 22px 70px rgba(15, 23, 42, 0.10);
}

.card.elevated {
  border: 1px solid rgba(39, 184, 199, 0.22);
  box-shadow: 0 22px 80px rgba(15, 23, 42, 0.12);
}

.cardHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.subtle {
  font-size: 12px;
  color: rgba(15, 23, 42, 0.55);
}

.headerRightInline {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Chips */
.chipGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  padding: 8px 11px;
  font-size: 12px;
  border-radius: 999px;
  color: rgba(15, 23, 42, 0.82);
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.10);
  transition: transform 140ms ease, background 140ms ease, border-color 140ms ease;
}

.chip:hover {
  transform: translateY(-1px);
  background: rgba(39, 184, 199, 0.10);
  border-color: rgba(39, 184, 199, 0.25);
}

/* Empty */
.empty {
  color: rgba(15, 23, 42, 0.65);
  font-size: 13px;
  padding: 10px 0 2px;
}

/* Lists */
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.listRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.08);
  transition: transform 150ms ease, border-color 150ms ease, background 150ms ease;
}

.listRow:hover {
  transform: translateY(-1px);
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(15, 23, 42, 0.12);
}

.bookmarkRow {
  cursor: pointer;
}

.rowTitle {
  font-size: 13px;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.90);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rowSubtle {
  font-size: 12px;
  color: rgba(15, 23, 42, 0.58);
  margin-top: 2px;
}

/* Snippets */
.snippetGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 980px) {
  .snippetGrid {
    grid-template-columns: 1fr;
  }
}

.snippetCard {
  border-radius: 18px;
  padding: 14px;
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.08);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.snippetCard:hover {
  transform: translateY(-2px);
  border-color: rgba(15, 23, 42, 0.12);
  box-shadow: 0 18px 55px rgba(15, 23, 42, 0.10);
}

.snippetTop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.snippetTitles {
  min-width: 0;
}

.snippetTopRight {
  display: inline-flex;
  gap: 10px;
  margin-top: 0px; 
  align-items: center;
}

.snippetTitle {
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: rgba(15, 23, 42, 0.95);
}

.snippetMeta {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.62);
}

/* Code */
.codeBlock {
  margin: 0;
  padding: 12px;
  border-radius: 16px;
  background: #0b1220;
  border: 1px solid rgba(15, 23, 42, 0.10);
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
  color: #e9eefc;
}

/* Actions */
.snippetActions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
}

/* Explanation */
.explainBox {
  margin-top: 12px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(39, 184, 199, 0.06);
  border: 1px solid rgba(39, 184, 199, 0.18);
}

.explainHeader {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: rgba(15, 23, 42, 0.90);
  margin-bottom: 6px;
}

.explainText {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: rgba(15, 23, 42, 0.82);
  white-space: pre-wrap;
}

/* Form */
.form {
  display: grid;
  gap: 12px;
}

.field label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.75);
  margin-bottom: 6px;
  letter-spacing: 0.2px;
}

.field input,
.field textarea {
  width: 100%;
  border-radius: 14px;
  padding: 10px 12px;
  outline: none;
  color: rgba(15, 23, 42, 0.90);
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.10);
  transition: box-shadow 140ms ease, border-color 140ms ease;
}

.field input:focus,
.field textarea:focus {
  border-color: rgba(39, 184, 199, 0.35);
  box-shadow: 0 0 0 5px rgba(39, 184, 199, 0.14);
}

.formActions {
  display: flex;
  gap: 10px;
  margin-top: 2px;
}

/* Buttons */
.primaryBtn,
.secondaryBtn,
.ghostBtn {
  border: none;
  border-radius: 14px;
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 900;
  letter-spacing: 0.25px;
  transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease, border-color 140ms ease;
}

.primaryBtn {
  background: linear-gradient(135deg, rgba(39, 184, 199, 0.98), rgba(70, 210, 182, 0.98));
  color: #071016;
  box-shadow: 0 12px 30px rgba(39, 184, 199, 0.18);
}

.primaryBtn:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 45px rgba(39, 184, 199, 0.22);
}

.primaryBtn:disabled {
  opacity: 0.78;
  cursor: not-allowed;
  box-shadow: none;
}

.primaryBtn.small {
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.secondaryBtn {
  background: rgba(15, 23, 42, 0.05);
  color: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(15, 23, 42, 0.10);
}

.secondaryBtn:hover {
  transform: translateY(-1px);
  background: rgba(15, 23, 42, 0.07);
  border-color: rgba(15, 23, 42, 0.14);
}

.secondaryBtn:disabled {
  opacity: 0.78;
  cursor: not-allowed;
}

.ghostBtn {
  background: rgba(15, 23, 42, 0.04);
  color: rgba(15, 23, 42, 0.80);
  border: 1px solid rgba(15, 23, 42, 0.10);
  padding: 10px 12px;
}

.ghostBtn:hover {
  transform: translateY(-1px);
  background: rgba(15, 23, 42, 0.06);
  border-color: rgba(15, 23, 42, 0.14);
}

.smallBtn {
  padding: 9px 10px !important;
  font-size: 12px;
  border-radius: 12px;
}

.btnIcon {
  margin-right: 10px;
  font-weight: 900;
}

.iconBtn {
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.10);
  color: rgba(15, 23, 42, 0.85);
  border-radius: 14px;
  padding: 10px 12px;
  cursor: pointer;
  transition: transform 140ms ease, background 140ms ease;
}

.iconBtn:hover {
  transform: translateY(-1px);
  background: rgba(15, 23, 42, 0.06);
}

/* Star + close icons */
.starBtn,
.closeBtn {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.10);
  background: rgba(39, 184, 199, 0.10);;
  color: rgba(15, 23, 42, 0.55);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: transform 140ms ease, background 140ms ease, border-color 140ms ease, color 140ms ease;
}
.starBtn {
  color: rgba(199, 175, 39, 0.901);
}

.starBtn.active {
   background: rgba(39, 184, 199, 0.85);   
   border-color: rgba(39, 184, 199, 0.95);
   color: #062f3362; 
   color: rgba(145, 125, 9, 0.745)
}

.starBtn:hover {
  transform: translateY(-1px);
  border-color: rgba(15, 23, 42, 0.14);
  
}

.starBtn.active:hover {
  background: rgba(39, 184, 199, 1);
  border-color: rgba(39, 184, 199, 1);
}

/* Red X button */
.closeBtn {
  background: rgba(239, 10, 10, 0.171);
  border-color: rgba(255, 90, 90, 0.22);
  color: rgba(154, 19, 19, 0.65);
}

.closeBtn:hover {
  background: rgba(252, 5, 5, 0.408);
  border-color: rgba(253, 0, 0, 0.309);
}

/* Errors */
.inlineError {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 90, 90, 0.10);
  border: 1px solid rgba(255, 90, 90, 0.18);
  color: rgba(155, 28, 28, 0.95);
  font-size: 13px;
}

/* Modal */
.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: flex-start;   
  justify-content: center;
  padding: 40px 18px;        
  overflow-y: auto;          
  z-index: 1000;
}


.modal {
  width: 100%;
  max-width: 980px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.10);
  border-radius: 18px;
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.25);
  padding: 16px;

  max-height: none;        
}

.modalBody {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 14px;
  margin-top: 10px;
  min-height: 500px;
}

/* left column layout */
.modalLeft {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.modalRight {
  max-height: 65vh;
  overflow: auto;
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.modalTitleMain {
  font-size: 16px;
  font-weight: 900;
  color: rgba(15, 23, 42, 0.95);
}

.modalTitleSub {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.62);
}

.modalHeaderRight {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.modalCode {
  margin: 0;
  min-width: 0;
}

.modalCodeWrap {
  max-height: 65vh;
  overflow: auto;
}

.modalActions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  justify-content: flex-end;
}

@media (max-width: 980px) {
  .modal {
    max-width: 820px;
  }
  .modalBody {
    grid-template-columns: 1fr;
    height: auto;
    max-height: calc(85vh - 86px);
    overflow: auto;
  }
  .modalRight {
    overflow: visible;
  }
}
</style>
