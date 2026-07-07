import { useEffect, useState } from "react";
import { FaCheckCircle, FaShieldAlt, FaExclamationTriangle, FaChartPie } from "react-icons/fa";
import { getEvidences } from "../services/evidenceService";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";

function Dashboard() {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        total: 0,
        authentic: 0,
        manipulated: 0,
        averageConfidence: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);
        setError(null);

        try {
            const evidences = await getEvidences();
            const total = evidences.length;
            const manipulated = evidences.filter((e) => e.manipulation).length;
            const authentic = total - manipulated;
            const averageConfidence = total
                ? evidences.reduce((sum, e) => sum + (e.confidence || 0), 0) / total
                : 0;

            setStats({
                total,
                authentic,
                manipulated,
                averageConfidence
            });
        } catch (err) {
            console.error(err);
            setError(t("dashboard.loadError"));
        } finally {
            setLoading(false);
        }
    }

    const data = [
        { name: "Authentic", value: stats.authentic },
        { name: "Manipulated", value: stats.manipulated }
    ];

    const manipulatedRate = stats.total ? ((stats.manipulated / stats.total) * 100).toFixed(1) : 0;
    const authenticRate = stats.total ? ((stats.authentic / stats.total) * 100).toFixed(1) : 0;
    const COLORS = ["#198754", "#dc3545"];

    return (
        <div className="container mt-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <h2 className="mb-1">{t("dashboard.title")}</h2>
                    <p className="text-muted mb-0">{t("dashboard.subtitle")}</p>
                </div>
                <button className="btn btn-outline-secondary" onClick={load} disabled={loading}>
                    {loading ? t("dashboard.loadingStatistics") : t("dashboard.refresh")}
                </button>
            </div>

            {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <FaExclamationTriangle className="me-2" />
                    {error}
                </div>
            )}

            <div className="row gy-4">
                <div className="col-sm-6 col-xl-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="bg-primary text-white rounded-3 p-3">
                                <FaChartPie size={22} />
                            </div>
                            <div>
                                <small className="text-uppercase text-secondary">{t("dashboard.totalCases")}</small>
                                <h3 className="mb-0">{stats.total}</h3>
                                <small className="text-muted">{t("dashboard.allUploaded")}</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="bg-success text-white rounded-3 p-3">
                                <FaCheckCircle size={22} />
                            </div>
                            <div>
                                <small className="text-uppercase text-secondary">{t("dashboard.authentic")}</small>
                                <h3 className="mb-0">{stats.authentic}</h3>
                                <small className="text-muted">{authenticRate}% of cases</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="bg-danger text-white rounded-3 p-3">
                                <FaShieldAlt size={22} />
                            </div>
                            <div>
                                <small className="text-uppercase text-secondary">{t("dashboard.manipulated")}</small>
                                <h3 className="mb-0">{stats.manipulated}</h3>
                                <small className="text-muted">{manipulatedRate}% of cases</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="bg-info text-white rounded-3 p-3">
                                <FaChartPie size={22} />
                            </div>
                            <div>
                                <small className="text-uppercase text-secondary">{t("dashboard.avgConfidence")}</small>
                                <h3 className="mb-0">{stats.averageConfidence.toFixed(1)}%</h3>
                                <small className="text-muted">{t("dashboard.modelConfidence")}</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row gy-4 mt-4">
                <div className="col-lg-7">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h4 className="card-title mb-3">AI Detection Statistics</h4>
                            {loading ? (
                                <div className="text-center py-5 text-muted">{t("dashboard.loadingStatistics")}</div>
                            ) : stats.total === 0 ? (
                                <div className="text-center py-5 text-muted">{t("dashboard.noEvidence")}</div>
                            ) : (
                                <div className="ratio ratio-4x3">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={data}
                                                dataKey="value"
                                                nameKey="name"
                                                outerRadius={100}
                                                label
                                            >
                                                {data.map((entry, index) => (
                                                    <Cell key={entry.name} fill={COLORS[index]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value} cases`} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-lg-5">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h4 className="card-title mb-3">Key Insights</h4>
                            {loading ? (
                                <div className="text-center py-5 text-muted">{t("dashboard.loadingInsights")}</div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    <div className="list-group-item px-0 py-3">
                                        <div className="d-flex justify-content-between">
                                            <span>{t("dashboard.authentic")} evidence share</span>
                                            <strong>{authenticRate}%</strong>
                                        </div>
                                    </div>
                                    <div className="list-group-item px-0 py-3">
                                        <div className="d-flex justify-content-between">
                                            <span>{t("dashboard.manipulated")} evidence share</span>
                                            <strong>{manipulatedRate}%</strong>
                                        </div>
                                    </div>
                                    <div className="list-group-item px-0 py-3">
                                        <div className="d-flex justify-content-between">
                                            <span>{t("dashboard.modelConfidence")}</span>
                                            <strong>{stats.averageConfidence.toFixed(1)}%</strong>
                                        </div>
                                    </div>
                                    <div className="list-group-item px-0 py-3">
                                        <div className="d-flex justify-content-between">
                                            <span>{t("dashboard.totalCases")}</span>
                                            <strong>{stats.total}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
