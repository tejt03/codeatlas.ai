<!-- Login.vue -->
<template>
  <div class="authPage">
    <div class="authCard">
      <div class="authHeader">
        <div class="brandTitle">CodeAtlas AI</div>
        <div class="brandSub">Sign in to manage your code snippets</div>
      </div>

      <form class="authForm" @submit.prevent="login">
        <div class="field">
          <label>Username</label>
          <input
            v-model.trim="user.username"
            type="text"
            placeholder="Enter username"
            autocomplete="username"
          />
        </div>

        <div class="field">
          <label>Password</label>
          <input
            v-model="user.password"
            type="password"
            placeholder="Enter password"
            autocomplete="current-password"
          />
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button class="primaryBtn" type="submit">Login</button>

        <div class="authFooter">
          <span class="muted">Not registered?</span>
          <RouterLink class="link" to="/register">Create an account</RouterLink>
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
        password: "",
      },
      error: null,
    };
  },
  methods: {
    async login() {
      console.log("login() clicked");
      console.log("API_BASE_URL =", API_BASE_URL);

      this.error = null;

      if (!this.user.username || !this.user.password) {
        this.error = "Username and password are required.";
        return;
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/users/login`, this.user);

        const token = response.headers.authorization;
        if (token) localStorage.setItem("authToken", token);

        localStorage.setItem("userId", response.data._id);

        this.$router.push(`/profile/${response.data._id}`);
      } catch (error) {
        this.error = error.response?.data?.error || "Login failed.";
      }
    },
  },
};
</script>

<style scoped>
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
  max-width: 460px;   
  min-height: 420px; 
  border-radius: 18px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.12);
}

.authHeader {
  margin-bottom: 18px;
  text-align: center;
}

.brandTitle {
  font-size: 30px; 
  font-weight: 900;
  letter-spacing: 0.2px;
  color: rgba(39, 184, 199, 0.98); 
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

.field label {
  display: block;
  font-size: 13px; 
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
  font-size: 14px;
  color: rgba(15, 23, 42, 0.90);
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.10);
  transition: box-shadow 140ms ease, border-color 140ms ease;
}

.field input::placeholder {
  font-size: 11px; 
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
  margin-top: 4px;
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
  margin-top: 6px;
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