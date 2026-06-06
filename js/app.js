const SUPABASE_URL =
"https://fkudvfkjjxmcbppvfinf.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrdWR2ZmtqanhtY2JwcHZmaW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzY3NzgsImV4cCI6MjA5NjMxMjc3OH0.iVb5dD1ySIogTJKhvpGlUkmi5PusSRMyG0EmmGAlrF8";

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const authContainer =
document.getElementById("authContainer");

const appContainer =
document.getElementById("appContainer");

const message =
document.getElementById("message");

const welcomeText =
document.getElementById("welcomeText");

function showMessage(text){
    message.innerText = text;
}

async function register(){

    const email =
    document.getElementById("email").value.trim();

    const password =
    document.getElementById("password").value.trim();

    const { data, error } =
    await supabaseClient.auth.signUp({
        email,
        password
    });

    if(error){
        showMessage(error.message);
        return;
    }

    showMessage("Registrazione completata");
}

async function login(){

    const email =
    document.getElementById("email").value.trim();

    const password =
    document.getElementById("password").value.trim();

    const { error } =
    await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if(error){
        showMessage(error.message);
        return;
    }

    loadUser();
}

async function logout(){

    await supabaseClient.auth.signOut();

    authContainer.style.display = "flex";
    appContainer.style.display = "none";
}

async function loadUser(){

    const {
        data:{ user }
    } =
    await supabaseClient.auth.getUser();

    if(!user){

        authContainer.style.display = "flex";
        appContainer.style.display = "none";

        return;
    }

    welcomeText.innerText =
    `Benvenuto ${user.email}`;

    authContainer.style.display = "none";
    appContainer.style.display = "flex";
}

document
.getElementById("registerBtn")
.addEventListener("click", register);

document
.getElementById("loginBtn")
.addEventListener("click", login);

document
.getElementById("logoutBtn")
.addEventListener("click", logout);

loadUser();
