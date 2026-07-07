import { useEffect, useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaFilter, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getEvidences } from "../services/evidenceService";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 8;

function EvidenceList() {
    const { t } = useTranslation();
    const [evidences, setEvidences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();

    useEffect(() => {
        loadEvidences();
    }, []);

    async function loadEvidences() {
        setLoading(true);
        setError(null);

        try {
            const data = await getEvidences();
            setEvidences(data);
        } catch (err) {
            console.error(err);
            setError(t("evidenceList.loadError") || "Unable to fetch evidence list. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    const filteredEvidences = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return evidences
            .filter((item) => {
                const matchesSearch = item.caseNumber?.toLowerCase().includes(normalizedSearch);
                const matchesStatus =
                    statusFilter === "all" ||
                    (statusFilter === "authentic" && !item.manipulation) ||
                    (statusFilter === "manipulated" && item.manipulation);

                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();

                return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
            });
    }, [evidences, search, statusFilter, sortOrder]);

    const pageCount = Math.max(1, Math.ceil(filteredEvidences.length / PAGE_SIZE));
    const currentPageEvidences = filteredEvidences.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const setPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (filter) => {
        setStatusFilter(filter);
        setCurrentPage(1);
    };

    const handleSortChange = (event) => {
        setSortOrder(event.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="container mt-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
                <div>
                    <h2 className="mb-1">{t("evidenceList.title")}</h2>
                    <p className="text-muted mb-0">{t("evidenceList.subtitle")}</p>
                </div>
                <button className="btn btn-outline-secondary" onClick={loadEvidences} disabled={loading}>
                    {loading ? t("buttons.refresh") : t("dashboard.refresh")}
                </button>
            </div>

            <div className="card shadow-sm mb-3">
                <div className="card-body">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><FaSearch className="text-secondary" /></span>
                                <input
                                    type="search"
                                    className="form-control border-start-0"
                                    placeholder={t("evidenceList.searchPlaceholder")}
                                    value={search}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="btn-group w-100" role="group">
                                <button
                                    type="button"
                                    className={`btn ${statusFilter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                                    onClick={() => handleFilterChange("all")}
                                >
                                    {t("evidenceList.all")}
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${statusFilter === "authentic" ? "btn-primary" : "btn-outline-primary"}`}
                                    onClick={() => handleFilterChange("authentic")}
                                >
                                    {t("evidenceList.authentic")}
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${statusFilter === "manipulated" ? "btn-primary" : "btn-outline-primary"}`}
                                    onClick={() => handleFilterChange("manipulated")}
                                >
                                    {t("evidenceList.manipulated")}
                                </button>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={sortOrder} onChange={handleSortChange}>
                                <option value="newest">{t("evidenceList.newest")}</option>
                                <option value="oldest">{t("evidenceList.oldest")}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Case</th>
                                    <th>Investigator</th>
                                    <th>Status</th>
                                    <th>Confidence</th>
                                    <th>Date</th>
                                    <th className="text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                            <td colSpan="6" className="text-center py-4 text-muted">
                                                {t("evidenceList.loading")}
                                            </td>
                                        </tr>
                                ) : currentPageEvidences.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">
                                                {t("evidenceList.noResults")}
                                        </td>
                                    </tr>
                                ) : (
                                    currentPageEvidences.map((evidence) => (
                                        <tr key={evidence._id}>
                                            <td>{evidence.caseNumber}</td>
                                            <td>{evidence.investigator}</td>
                                            <td>
                                                    <span className={`badge ${evidence.manipulation ? "bg-danger" : "bg-success"}`}>
                                                    {evidence.manipulation ? t("evidenceList.manipulated") : t("evidenceList.authentic")}
                                                </span>
                                            </td>
                                            <td>{typeof evidence.confidence === "number" ? `${(evidence.confidence * 100).toFixed(1)}%` : "N/A"}</td>
                                            <td>{new Date(evidence.createdAt).toLocaleDateString()}</td>
                                                <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => navigate(`/evidence/${evidence._id}`)}
                                                >
                                                    {t("evidenceList.view")}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
                <p className="mb-0 text-muted">
                    {t("evidenceList.showing", { count: currentPageEvidences.length, total: filteredEvidences.length, plural: filteredEvidences.length === 1 ? "" : "s" })}
                </p>
                <nav aria-label="Evidence list pagination">
                    <ul className="pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
                                <FaChevronLeft />
                            </button>
                        </li>
                        {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                            <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                                <button className="page-link" onClick={() => setPage(page)}>
                                    {page}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === pageCount ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount}>
                                <FaChevronRight />
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default EvidenceList;
