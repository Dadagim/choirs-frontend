import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiMusic, FiUser, FiUsers} from "react-icons/fi";
import {api} from "../api.js";
import churchLogo from "../assets/logo.jpg";
import "./AuthForm.css";

function getErrorMessage(error) {
    const data = error.response?.data;

    if (typeof data === "string") {
        return data;
    }

    if (typeof data?.detail === "string") {
        return data.detail;
    }

    if (data && typeof data === "object") {
        const message = Object.values(data)
            .flat()
            .find((value) => typeof value === "string");

        if (message) {
            return message;
        }
    }

    return "We couldn't complete your request. Please try again.";
}

function AuthForm() {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    function changeMethod() {
        setIsRegister((current) => !current);
        setErrorMessage("");
        setSuccessMessage("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            if (isRegister) {
                await api.post("/users/register/", {
                    first_name: firstName,
                    last_name: lastName,
                    username,
                    email,
                    password,
                });
                setIsRegister(false);
                setSuccessMessage("Your account is ready. Sign in with your new username.");
            } else {
                const response = await api.post("api/token/", {
                    username: username.trim(),
                    password,
                });

                localStorage.setItem("access", response.data.access);
                localStorage.setItem("refresh", response.data.refresh);
                navigate("/");
            }
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-shell" aria-label="Account access">
                <aside className="auth-brand-panel">
                    <div className="auth-brand">
                        <img src={churchLogo} alt="Dato Fares Church" className="auth-brand-logo"/>
                        <div>
                            <span className="auth-brand-name">DATO FARES</span>
                            <span className="auth-brand-caption">WORSHIP MINISTRY</span>
                        </div>
                    </div>

                    <div className="auth-brand-copy">
                        <span className="auth-eyebrow"><FiMusic aria-hidden="true"/> GROW TOGETHER IN WORSHIP</span>
                        <h1>Your voice<br/>belongs here.</h1>
                        <p>A home for our choir family to connect, serve, and share the joy of worship.</p>
                    </div>

                    <div className="auth-community-card">
                        <div className="auth-community-icon"><FiUsers aria-hidden="true"/></div>
                        <div>
                            <strong>One community. One song.</strong>
                            <span>Stay close to the people and moments that matter.</span>
                        </div>
                    </div>
                    <span className="auth-brand-footer">DATO FARES HEWOT BERHAN CHURCH</span>
                    <span className="auth-orbit auth-orbit-one" aria-hidden="true"/>
                    <span className="auth-orbit auth-orbit-two" aria-hidden="true"/>
                </aside>

                <div className="auth-form-panel">
                    <div className="auth-form-content">
                        <div className="auth-mobile-brand">
                            <img src={churchLogo} alt="" className="auth-brand-logo"/>
                            <span>DATO FARES <small>WORSHIP MINISTRY</small></span>
                        </div>

                        <span className="auth-form-eyebrow">{isRegister ? "JOIN THE COMMUNITY" : "WELCOME BACK"}</span>
                        <h2>{isRegister ? "Create your account" : "Good to see you again."}</h2>
                        <p className="auth-form-intro">
                            {isRegister
                                ? "A few details and you’ll be part of the family."
                                : "Sign in to stay connected with your choir community."}
                        </p>

                        <form className="auth-form" onSubmit={handleSubmit}>
                            {isRegister ? (
                                <>
                                    <div className="auth-name-fields">
                                        <label className="auth-field">
                                            <span>First name</span>
                                            <div className="auth-input-wrap">
                                                <FiUser aria-hidden="true"/>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    autoComplete="given-name"
                                                    placeholder="Your first name"
                                                    value={firstName}
                                                    onChange={(event) => setFirstName(event.target.value)}
                                                    required
                                                />
                                            </div>
                                        </label>
                                        <label className="auth-field">
                                            <span>Last name</span>
                                            <div className="auth-input-wrap">
                                                <FiUser aria-hidden="true"/>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    autoComplete="family-name"
                                                    placeholder="Your last name"
                                                    value={lastName}
                                                    onChange={(event) => setLastName(event.target.value)}
                                                    required
                                                />
                                            </div>
                                        </label>
                                    </div>
                                    <label className="auth-field">
                                        <span>Username</span>
                                        <div className="auth-input-wrap">
                                            <FiUser aria-hidden="true"/>
                                            <input
                                                type="text"
                                                name="username"
                                                autoComplete="username"
                                                placeholder="Choose a username"
                                                value={username}
                                                onChange={(event) => setUsername(event.target.value)}
                                                required
                                            />
                                        </div>
                                    </label>
                                    <label className="auth-field">
                                        <span>Email address</span>
                                        <div className="auth-input-wrap">
                                            <FiMail aria-hidden="true"/>
                                            <input
                                                type="email"
                                                name="email"
                                                autoComplete="email"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(event) => setEmail(event.target.value)}
                                                required
                                            />
                                        </div>
                                    </label>
                                </>
                            ) : (
                                <label className="auth-field">
                                    <span>Username</span>
                                    <div className="auth-input-wrap">
                                        <FiUser aria-hidden="true"/>
                                        <input
                                            type="text"
                                            name="username"
                                            autoComplete="username"
                                            placeholder="Enter your username"
                                            value={username}
                                            onChange={(event) => setUsername(event.target.value)}
                                            required
                                        />
                                    </div>
                                </label>
                            )}

                            <label className="auth-field">
                                <span>Password</span>
                                <div className="auth-input-wrap">
                                    <FiLock aria-hidden="true"/>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        autoComplete={isRegister ? "new-password" : "current-password"}
                                        placeholder={isRegister ? "Create a password" : "Enter your password"}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        required
                                    />
                                    <button
                                        className="auth-password-toggle"
                                        type="button"
                                        onClick={() => setShowPassword((current) => !current)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <FiEyeOff aria-hidden="true"/> : <FiEye aria-hidden="true"/>}
                                    </button>
                                </div>
                            </label>

                            {errorMessage && <p className="auth-message auth-error" role="alert">{errorMessage}</p>}
                            {successMessage && <p className="auth-message auth-success" role="status">{successMessage}</p>}

                            <button className="auth-submit" type="submit" disabled={loading}>
                                <span>{loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}</span>
                                {!loading && <FiArrowRight aria-hidden="true"/>}
                            </button>
                        </form>

                        <p className="auth-switch">
                            {isRegister ? "Already have an account?" : "New to the community?"}
                            <button type="button" onClick={changeMethod}>
                                {isRegister ? "Sign in" : "Create an account"}
                            </button>
                        </p>

                        <div className="auth-form-footer">
                            <FiLock aria-hidden="true"/>
                            <span>Your account information is kept private and secure.</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default AuthForm;
