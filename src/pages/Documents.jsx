import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    FileText,
    FolderOpen,
    Receipt,
    FileCheck,
    MapPinned,
} from "lucide-react";
import { api } from "@/services/api";

const Documents = () => {
    const [allDocuments, setAllDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getDocuments(1).then(data => {
            setAllDocuments(data);
            setLoading(false);
        });
    }, []);

    const invoices = allDocuments.filter((d) => d.docType === "invoice");
    const receipts = allDocuments.filter((d) => d.docType === "receipt");
    const itineraries = allDocuments.filter((d) => d.docType === "itinerary");
    const confirmations = allDocuments.filter((d) => d.docType === "confirmation");

    if (loading) {
        return (
            <DashboardLayout showSearch={false}>
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading documents...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout showSearch={false}>
            {/* Page Header */}
            <section className="animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                            <FileText className="h-6 w-6 text-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold">Documents</h1>
                            <p className="text-muted-foreground">
                                Access all your travel documents in one place
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Cards */}
            <section
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up"
                style={{ animationDelay: "0.1s" }}
            >
                <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{invoices.length}</p>
                        <p className="text-sm text-muted-foreground">Invoices</p>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <FileCheck className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{receipts.length}</p>
                        <p className="text-sm text-muted-foreground">Receipts</p>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <MapPinned className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{itineraries.length}</p>
                        <p className="text-sm text-muted-foreground">Itineraries</p>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{allDocuments.length}</p>
                        <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                </div>
            </section>

            {/* Documents Tabs */}
            <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <Tabs defaultValue="all" className="space-y-4">
                    <TabsList className="bg-secondary">
                        <TabsTrigger value="all" className="data-[state=active]:bg-card data-[state=active]:shadow-soft">
                            All ({allDocuments.length})
                        </TabsTrigger>
                        <TabsTrigger value="invoices" className="data-[state=active]:bg-card data-[state=active]:shadow-soft">
                            Invoices ({invoices.length})
                        </TabsTrigger>
                        <TabsTrigger value="receipts" className="data-[state=active]:bg-card data-[state=active]:shadow-soft">
                            Receipts ({receipts.length})
                        </TabsTrigger>
                        <TabsTrigger value="itineraries" className="data-[state=active]:bg-card data-[state=active]:shadow-soft">
                            Itineraries ({itineraries.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {allDocuments.map((doc, index) => (
                                <DocumentCard
                                    key={index}
                                    title={doc.title}
                                    type={doc.docType}
                                    date={new Date(doc.createdAt).toLocaleDateString()}
                                    size={doc.fileSize}
                                />
                            ))}
                            {allDocuments.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No documents found
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="invoices" className="mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {invoices.map((doc, index) => (
                                <DocumentCard
                                    key={index}
                                    title={doc.title}
                                    type={doc.docType}
                                    date={new Date(doc.createdAt).toLocaleDateString()}
                                    size={doc.fileSize}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="receipts" className="mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {receipts.map((doc, index) => (
                                <DocumentCard
                                    key={index}
                                    title={doc.title}
                                    type={doc.docType}
                                    date={new Date(doc.createdAt).toLocaleDateString()}
                                    size={doc.fileSize}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="itineraries" className="mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {itineraries.map((doc, index) => (
                                <DocumentCard
                                    key={index}
                                    title={doc.title}
                                    type={doc.docType}
                                    date={new Date(doc.createdAt).toLocaleDateString()}
                                    size={doc.fileSize}
                                />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </section>
        </DashboardLayout>
    );
};

export default Documents;