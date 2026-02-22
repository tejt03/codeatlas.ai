<!-- Register.vue -->
<template>
  <div class="authPage">
    <div class="authCard">
      <div class="authHeader">
        <div class="brandTitle">CodeAtlas AI</div>
        <div class="brandSub">Create an account to manage your code snippets</div>
      </div>

      <form class="authForm" @submit.prevent="register">
        <div class="grid2">
          <!-- Username -->
          <div class="field span2">
            <label>Username</label>
            <input
              v-model.trim="user.username"
              type="text"
              placeholder="Choose a username"
              autocomplete="username"
            />
          </div>

          <!-- Password -->
          <div class="field span2">
            <label>Password</label>
            <input
              v-model="user.password"
              type="password"
              placeholder="Create a password"
              autocomplete="new-password"
            />
          </div>

          <!-- Years Experience -->
          <div class="field">
            <label>Years of Experience</label>
            <input v-model.trim="user.years_experience" type="number" min="0" placeholder="e.g. 2" />
          </div>

          <!-- Programming Languages -->
          <div class="field">
            <label>Programming Languages</label>
            <input
              v-model.trim="user.programming_languages"
              type="text"
              placeholder="e.g. Python, JavaScript, Java"
            />
          </div>
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button class="primaryBtn" type="submit">Register</button>

        <div class="authFooter">
          <span class="muted">Already registered?</span>
          <RouterLink class="link" to="/login">Login</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default {
  data() {
    return {
      user: {
        username: "",
        years_experience: "",
        programming_languages: "",
        password: "",
      },
      error: null,
    };
  },
  methods: {
    async register() {
      this.error = null;

      if (!this.user.username || !this.user.password) {
        this.error = "Username and password are required.";
        return;
      }

      try {
        const payload = { ...this.user };

        payload.years_experience = payload.years_experience ? Number(payload.years_experience) : 0;
        payload.programming_languages = (payload.programming_languages || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        await axios.post(`${API_BASE_URL}/users/register`, payload);

        this.$router.push("/login");
      } catch (error) {
        this.error = error.response?.data?.error || "Registration failed (username may already exist).";
      }
    },
  },
};
</script>

<style scoped>
/* Match Profile.vue light theme */
.authPage {
  min-height: 100vh;
  padding: 26px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(900px 420px at 10% 10%, rgba(39, 184, 199, 0.10), transparent 60%),
    radial-gradient(820px 420px at 92% 12%, rgba(215, 168, 195, 0.08), transparent 60%),
    linear-gradient(180deg, #f7f8fb 0%, #f4f6fa 40%, #eef1f7 100%);
  color: #0f172a;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
}

.authCard {
  width: 100%;
  max-width: 460px;     /* less wide */
  min-height: 480px;    /* a bit taller */
  border-radius: 18px;
  padding: 22px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.12);
}

.authHeader {
  margin-bottom: 16px;
  text-align: center;
}

.brandTitle {
  font-size: 30px; 
  font-weight: 900;
  letter-spacing: 0.2px;
  color: rgba(39, 183, 199, 0.948); /* match button */
  text-align: center;
}

.brandSub {
  margin-top: 6px;
  font-size: 11px;
  color: rgba(15, 23, 42, 0.60);
  text-align: center;
}

.authForm {
  display: grid;
  gap: 14px;
}

.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 720px) {
  .grid2 {
    grid-template-columns: 1fr;
  }
  .span2 {
    grid-column: auto;
  }
}

.span2 {
  grid-column: 1 / -1;
}

.field label {
  display: block;
  font-size: 13px; /* a bit larger */
  font-weight: 800;
  color: rgba(15, 23, 42, 0.80);
  margin-bottom: 7px;
  letter-spacing: 0.2px;
}

.field input {
  width: 100%;
  border-radius: 14px;
  padding: 11px 12px;
  outline: none;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.90);
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.10);
  transition: box-shadow 140ms ease, border-color 140ms ease;
}

.field input::placeholder {
  font-size: 11px; /* smaller placeholder text */
  color: rgba(15, 23, 42, 0.45);
}

.field input:focus {
  border-color: rgba(39, 184, 199, 0.35);
  box-shadow: 0 0 0 5px rgba(39, 184, 199, 0.14);
}

.primaryBtn {
  border: none;
  border-radius: 14px;
  padding: 9px 9px;
  cursor: pointer;
  font-weight: 900;
  letter-spacing: 0.25px;
  background: linear-gradient(135deg, rgba(39, 184, 199, 0.98), rgba(70, 210, 182, 0.98));
  color: #071016;
  box-shadow: 0 12px 30px rgba(39, 184, 199, 0.18);
  transition: transform 140ms ease, box-shadow 140ms ease;
}

.primaryBtn:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 45px rgba(39, 184, 199, 0.22);
}

.error {
  margin: 2px 0 0;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 90, 90, 0.10);
  border: 1px solid rgba(255, 90, 90, 0.18);
  color: rgba(155, 28, 28, 0.95);
  font-size: 13px;
}

.authFooter {
  margin-top: 2px;
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  font-size: 13px;
}

.muted {
  color: rgba(15, 23, 42, 0.65);
}

.link {
  color: rgba(39, 184, 199, 0.95);
  font-weight: 900;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}
</style>