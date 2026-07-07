import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useTranslation } from "react-i18next";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg", "video/mp4"];

function AddEvidence() {
    const { t } = useTranslation();
    const [form, setForm] = useState({
        caseNumber: "",
        caseType: "",
        investigator: "",
        seizureLocation: "",
        seizureDate: "",
        description: ""
    });
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        return () => {
            if (file && file.preview) {
                URL.revokeObjectURL(file.preview);
            }
        };
    }, [file]);

    const previewUrl = useMemo(() => {
        if (!file || !file.type?.startsWith("image/")) {
            return null;
        }
        return file.preview || URL.createObjectURL(file);
    }, [file]);

    const validateFile = (selected) => {
        if (!selected) {
            setError(t("addEvidence.selectFile"));
            return false;
        }
        if (!ACCEPTED_TYPES.includes(selected.type)) {
            setError(t("addEvidence.unsupportedFile"));
            return false;
        }
        return true;
    };

    const handleFile = (selected) => {
        setError(null);
        setSuccess(null);

        if (!validateFile(selected)) {
            return;
        }

        if (file && file.preview) {
            URL.revokeObjectURL(file.preview);
        }

        selected.preview = selected.type.startsWith("image/") ? URL.createObjectURL(selected) : null;
        setFile(selected);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setForm((prevForm) => ({ ...prevForm, [name]: value }));
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragActive(false);
        const selected = event.dataTransfer.files[0];
        if (selected) {
            handleFile(selected);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (!form.caseNumber || !form.caseType || !form.investigator || !form.seizureLocation || !form.seizureDate) {
            setError(t("addEvidence.requiredFields"));
            return;
        }

        if (!validateFile(file)) {
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            Object.keys(form).forEach((key) => {
                formData.append(key, form[key]);
            });
            formData.append("file", file);

            await api.post("/evidences", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                }
            });

            setSuccess(t("addEvidence.uploadSuccess"));
            setForm({
                caseNumber: "",
                caseType: "",
                investigator: "",
                seizureLocation: "",
                seizureDate: "",
                description: ""
            });
            setFile(null);
        } catch (err) {
            console.error(err);
            setError(
                err?.response?.data?.message ||
                t("addEvidence.uploadFailed")
            );
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
                        <div>
                                    <h2 className="mb-1">{t("addEvidence.title")}</h2>
                                    <p className="text-muted mb-0">
                                        {t("addEvidence.subtitle")}
                                    </p>
                        </div>
                        <div className="text-end">
                            <span className="badge bg-secondary">Upload feature</span>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="alert alert-success" role="alert">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div
                            className={`border rounded p-4 mb-4 text-center ${dragActive ? "border-primary bg-white" : "border-dashed bg-light"}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragActive(true);
                            }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                        >
                            <p className="mb-2">
                                <strong>{t("addEvidence.dragDrop")}</strong>
                            </p>
                            <p className="text-muted mb-3">{t("addEvidence.accepted")}</p>
                            <label className="btn btn-outline-primary btn-sm">
                                {t("addEvidence.browse")}
                                <input
                                    type="file"
                                    className="d-none"
                                    onChange={(e) => handleFile(e.target.files[0])}
                                    accept={ACCEPTED_TYPES.join(",")}
                                />
                            </label>
                            {file && (
                                <div className="mt-3 text-start small text-secondary">
                                    {t("addEvidence.selectedFile", { name: file.name, size: (file.size / 1024 / 1024).toFixed(2) })}
                                </div>
                            )}
                        </div>

                        {previewUrl && (
                            <div className="mb-4">
                                <div className="mb-2">{t("addEvidence.preview")}</div>
                                <img src={previewUrl} alt="Preview" className="img-fluid rounded shadow-sm" />
                            </div>
                        )}

                        <div className="row g-3">
                            <div className="col-lg-6">
                                <label className="form-label">{t("addEvidence.caseNumber")} <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="caseNumber"
                                    className="form-control"
                                    value={form.caseNumber}
                                    onChange={handleInputChange}
                                    placeholder={t("addEvidence.caseNumber")}
                                    required
                                />
                            </div>
                            <div className="col-lg-6">
                                <label className="form-label">{t("addEvidence.caseType")} <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="caseType"
                                    className="form-control"
                                    value={form.caseType}
                                    onChange={handleInputChange}
                                    placeholder={t("addEvidence.caseType")}
                                    required
                                />
                            </div>
                            <div className="col-lg-6">
                                <label className="form-label">{t("addEvidence.investigator")} <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="investigator"
                                    className="form-control"
                                    value={form.investigator}
                                    onChange={handleInputChange}
                                    placeholder={t("addEvidence.investigator")}
                                    required
                                />
                            </div>
                            <div className="col-lg-6">
                                <label className="form-label">{t("addEvidence.seizureLocation")} <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="seizureLocation"
                                    className="form-control"
                                    value={form.seizureLocation}
                                    onChange={handleInputChange}
                                    placeholder={t("addEvidence.seizureLocation")}
                                    required
                                />
                            </div>
                            <div className="col-lg-6">
                                <label className="form-label">{t("addEvidence.seizureDate")} <span className="text-danger">*</span></label>
                                <input
                                    type="date"
                                    name="seizureDate"
                                    className="form-control"
                                    value={form.seizureDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label">{t("addEvidence.description")}</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    placeholder={t("addEvidence.description")}
                                    rows="4"
                                />
                            </div>
                        </div>

                        {uploadProgress > 0 && (
                            <div className="progress my-4" style={{ height: "8px" }}>
                                <div
                                    className="progress-bar progress-bar-striped progress-bar-animated"
                                    role="progressbar"
                                    style={{ width: `${uploadProgress}%` }}
                                    aria-valuenow={uploadProgress}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                >
                                    {uploadProgress}%
                                </div>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? t("addEvidence.uploading") : t("addEvidence.upload")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddEvidence;
