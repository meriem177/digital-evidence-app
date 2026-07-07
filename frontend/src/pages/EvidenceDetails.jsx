import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaFilePdf, FaShieldAlt, FaWaveSquare } from "react-icons/fa";
import { getEvidence, verifyIntegrity } from "../services/evidenceService";
import { useTranslation } from "react-i18next";

function EvidenceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [evidence, setEvidence] = useState(null);
    const [integrity, setIntegrity] = useState(null);
    const [checking, setChecking] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadEvidence();
    }, [id]);

    async function loadEvidence() {
        setLoading(true);
        setError(null);

        try {
            const data = await getEvidence(id);
            setEvidence(data);
        } catch (err) {
            console.error(err);
            setError(t("evidenceDetails.loadError") || "Unable to load evidence details. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    async function checkIntegrity() {
        setChecking(true);
        setError(null);

        try {
            const data = await verifyIntegrity(id);
            setIntegrity(data);
        } catch (err) {
            console.error(err);
            setError(t("evidenceDetails.integrityFailed") || "Integrity check failed. Please try again.");
        } finally {
            setChecking(false);
        }
    }

    const assetBaseUrl = useMemo(
        () => (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, ""),
        []
    );

    const originalUrl = useMemo(
        () => evidence?.filePath ? `${assetBaseUrl}/${evidence.filePath.replace(/\\/g, "/")}` : null,
        [assetBaseUrl, evidence]
    );

    const confidenceValue = evidence?.confidence != null ? Math.round(evidence.confidence * 100) : 0;
    const confidenceLabel = evidence?.confidence != null ? `${confidenceValue}%` : "N/A";

    return (
        <div className="container mt-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <h2 className="mb-1">{t("evidenceDetails.title")}</h2>
                    <p className="text-muted mb-0">{t("evidenceDetails.subtitle")}</p>
                </div>
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    <FaArrowLeft className="me-2" /> {t("evidenceDetails.back")}
                </button>
            </div>

            {loading ? (
                <div className="card shadow-sm py-5 text-center text-muted">
                    {t("generic.loading")}
                </div>
            ) : error ? (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            ) : (
                evidence && (
                    <div className="row gy-4">
                        <div className="col-xl-8">
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="card shadow-sm h-100">
                                        <div className="card-body">
                                            <h5 className="card-title mb-3">{t("evidenceDetails.originalEvidence")}</h5>
                                            {originalUrl ? (
                                                <img src={originalUrl} alt="Original Evidence" className="img-fluid rounded" />
                                            ) : (
                                                <div className="text-center text-muted py-5">{t("evidenceDetails.noFile")}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card shadow-sm h-100">
                                        <div className="card-body">
                                            <h5 className="card-title mb-3">{t("evidenceDetails.aiHeatmap")}</h5>
                                            {evidence.heatmap ? (
                                                <img src={evidence.heatmap} alt="Heatmap" className="img-fluid rounded" />
                                            ) : (
                                                <div className="text-center text-muted py-5">{t("evidenceDetails.heatmapUnavailable")}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row g-4 mt-0">
                                <div className="col-md-12">
                                    <div className="card shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title mb-3">{t("evidenceDetails.caseInformation")}</h5>
                                            <div className="row">
                                                <div className="col-sm-6 mb-3">
                                                    <div className="text-secondary">{t("addEvidence.caseNumber")}</div>
                                                    <div>{evidence.caseNumber}</div>
                                                </div>
                                                <div className="col-sm-6 mb-3">
                                                    <div className="text-secondary">{t("addEvidence.caseType")}</div>
                                                    <div>{evidence.caseType}</div>
                                                </div>
                                                <div className="col-sm-6 mb-3">
                                                    <div className="text-secondary">{t("addEvidence.investigator")}</div>
                                                    <div>{evidence.investigator}</div>
                                                </div>
                                                <div className="col-sm-6 mb-3">
                                                    <div className="text-secondary">{t("addEvidence.seizureLocation")}</div>
                                                    <div>{evidence.seizureLocation}</div>
                                                </div>
                                                <div className="col-sm-6 mb-3">
                                                    <div className="text-secondary">{t("addEvidence.seizureDate")}</div>
                                                    <div>{new Date(evidence.seizureDate).toLocaleDateString()}</div>
                                                </div>
                                                <div className="col-sm-6 mb-3">
                                                    <div className="text-secondary">{t("evidenceDetails.uploaded") || "Uploaded"}</div>
                                                    <div>{new Date(evidence.createdAt).toLocaleString()}</div>
                                                </div>
                                                <div className="col-12">
                                                    <div className="text-secondary">{t("addEvidence.description")}</div>
                                                    <div>{evidence.description || t("evidenceDetails.noDescription")}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-4">
                            <div className="card shadow-sm mb-4">
                                <div className="card-body">
                                    <h5 className="card-title mb-3">{t("evidenceDetails.aiSummary")}</h5>
                                    <div className="mb-3">
                                        <span className={`badge ${evidence.manipulation ? "bg-danger" : "bg-success"} py-2 px-3 fs-6`}>
                                            {evidence.manipulation ? t("evidenceList.manipulated") : t("evidenceList.authentic")}
                                        </span>
                                    </div>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>{t("evidenceDetails.confidence")}</span>
                                            <strong>{confidenceLabel}</strong>
                                        </div>
                                        <div className="progress" style={{ height: "10px" }}>
                                            <div
                                                className={`progress-bar ${evidence.manipulation ? "bg-danger" : "bg-success"}`}
                                                role="progressbar"
                                                style={{ width: `${confidenceValue}%` }}
                                                aria-valuenow={confidenceValue}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="text-secondary mb-2">{t("evidenceDetails.aiAnalysis")}</div>
                                        <div className="small text-wrap">
                                            {evidence.analysis && Object.keys(evidence.analysis).length > 0 ? (
                                                <ul className="ps-3 mb-0">
                                                    {Object.entries(evidence.analysis).map(([key, value]) => (
                                                        <li key={key}>
                                                            <strong>{key}:</strong> {String(value)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-muted">{t("evidenceDetails.noAnalysis")}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="text-secondary mb-2">{t("evidenceDetails.metadata")}</div>
                                        {evidence.metadata && Object.keys(evidence.metadata).length > 0 ? (
                                            <div className="row row-cols-1 g-2">
                                                {Object.entries(evidence.metadata).map(([key, value]) => (
                                                    <div key={key} className="col">
                                                        <div className="card card-sm shadow-sm p-2">
                                                            <div className="small text-secondary">{key}</div>
                                                            <div>{String(value)}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-muted">{t("evidenceDetails.noMetadata")}</div>
                                        )}
                                    </div>
                                    <div className="d-grid gap-2">
                                        <button className="btn btn-warning" onClick={checkIntegrity} disabled={checking}>
                                            {checking ? t("evidenceDetails.verifying") : t("evidenceDetails.verifyIntegrity")}
                                        </button>
                                        <a
                                            className="btn btn-success"
                                            href={evidence.report || "#"}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <FaFilePdf className="me-2" /> {t("evidenceDetails.downloadReport")}
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title mb-3">{t("evidenceDetails.integrityStatus")}</h5>
                                    {integrity ? (
                                        <div className={`alert ${integrity.status === "INTACT" ? "alert-success" : "alert-danger"}`}>
                                            <div className="mb-2">
                                                <FaShieldAlt className="me-2" />
                                                {integrity.status === "INTACT" ? t("evidenceDetails.evidenceIntact") : t("evidenceDetails.evidenceModified")}
                                            </div>
                                            <div className="small">{integrity.message}</div>
                                            <div className="mt-3 small text-muted">
                                                Stored Hash: {integrity.storedHash}
                                                <br />
                                                Current Hash: {integrity.currentHash}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-muted">{t("evidenceDetails.runIntegrity")}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}

export default EvidenceDetails;
