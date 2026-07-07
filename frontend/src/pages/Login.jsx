import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { isAuthenticated, setSession } from "../utils/auth";
import { useTranslation } from "react-i18next";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (isAuthenticated()) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleLogin = async (event) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await login(email, password);
            setSession(data.token, data.user, remember);
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError(
                err?.response?.data?.message || t("login.failed")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-sm">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-4">{t("login.title")}</h2>
                            <p className="text-muted text-center mb-4">
                                {t("login.subtitle")}
                            </p>
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleLogin} noValidate>
                                <div className="mb-3">
                                    <label className="form-label">{t("login.email")}</label>
                                    <input
                                        className="form-control"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">{t("login.password")}</label>
                                    <input
                                        className="form-control"
                                        type="password"
                                        placeholder={t("login.password")}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-check mb-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="rememberMe"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="rememberMe">
                                        {t("login.remember")}
                                    </label>
                                </div>
                                <button
                                    className="btn btn-primary w-100"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? t("login.signingIn") : t("login.login")}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;