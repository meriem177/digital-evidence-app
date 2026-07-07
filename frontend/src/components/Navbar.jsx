import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getUser, logout as clearSession } from "../utils/auth";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const user = getUser();
    const { t } = useTranslation();

    if (location.pathname === "/") {
        return null;
    }

    function logout() {
        const confirmed = window.confirm(t("nav.confirmLogout"));
        if (!confirmed) return;

        clearSession();
        navigate("/");
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container">
                <NavLink className="navbar-brand fw-bold" to="/dashboard">
                    {t("nav.brand")}
                </NavLink>
                <button
                    className="navbar-toggler"
                    type="button"
                    aria-controls="navbarMain"
                    aria-expanded={menuOpen}
                    aria-label="Toggle navigation"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span className="navbar-toggler-icon" />
                </button>

                <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`} id="navbarMain">
                    <ul className="navbar-nav ms-auto align-items-lg-center">
                        <li className="nav-item">
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/dashboard">
                                {t("nav.dashboard")}
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/add">
                                {t("nav.addEvidence")}
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/evidences">
                                {t("nav.evidenceList")}
                            </NavLink>
                        </li>
                        <li className="nav-item dropdown ms-lg-3 d-flex align-items-center">
                            <LanguageSelector />
                            <div className="ms-2 dropdown">
                                <button className="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {user?.fullName || t("nav.user.noEmail")}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <span className="dropdown-item-text text-muted">{user?.email || t("nav.user.noEmail")}</span>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button className="dropdown-item text-danger" onClick={logout}>
                                            {t("nav.logout")}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
