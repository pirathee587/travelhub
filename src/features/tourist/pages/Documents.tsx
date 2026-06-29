import { useState, useEffect } from "react";
import { DashboardLayout } from "@/features/tourist/components/dashboard/DashboardLayout";
import { DocumentCard } from "@/features/tourist/components/dashboard/DocumentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/ui/tabs";
import {
    FileText,
    FolderOpen,
    Receipt,
    FileCheck,
    MapPinned,
} from "lucide-react";
import { api } from "@/features/tourist/services/api";
import { DocumentsPageSkeleton } from "@/components/common/ui/skeletons";
import { defaultUserId } from "@/features/tourist/services/userHelpers";

const Documents = () => {
    const [allDocuments, setAllDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getDocuments(defaultUserId()).then(data => {
            setAllDocuments(data);
            setLoading(false);
        });
    }, []);

    const invoices = allDocuments.filter((d) => d.docType?.toLowerCase() === "invoice");
    const receipts = allDocuments.filter((d) => d.docType?.toLowerCase() === "receipt");
    const itineraries = allDocuments.filter((d) => d.docType?.toLowerCase() === "itinerary");
    const confirmations = allDocuments.filter((d) => d.docType?.toLowerCase() === "confirmation");

    if (loading) {
        return (
            <DashboardLayout>
                <DocumentsPageSkeleton />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Page Header */}
            <section className="animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                            <FileText className="h-6 w-6 text-foreground" />.                                {/* Document Icon */}
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
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up py-8"
                style={{ animationDelay: "0.1s" }}
            >
                <div className="bg-card rounded-2xl p-5 border border-border/50 flex items-center gap-4 shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold tracking-tight">{invoices.length}</p>
                        <p className="text-sm font-medium text-muted-foreground">Invoices</p>
                    </div>
                </div>

                <div className="bg-card rounded-2xl p-5 border border-border/50 flex items-center gap-4 shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <FileCheck className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold tracking-tight">{receipts.length}</p>
                        <p className="text-sm font-medium text-muted-foreground">Receipts</p>
                    </div>
                </div>

                <div className="bg-card rounded-2xl p-5 border border-border/50 flex items-center gap-4 shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <MapPinned className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold tracking-tight">{itineraries.length}</p>
                        <p className="text-sm font-medium text-muted-foreground">Itineraries</p>
                    </div>
                </div>

                <div className="bg-card rounded-2xl p-5 border border-border/50 flex items-center gap-4 shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <FolderOpen className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold tracking-tight">{allDocuments.length}</p>
                        <p className="text-sm font-medium text-muted-foreground">Total</p>
                    </div>
                </div>
            </section>

            {/* Documents Tabs */}
            <section className="animate-slide-up py-1" style={{ animationDelay: "0.2s" }}>
                <Tabs defaultValue="all" className="space-y-4">
                    <TabsList className="bg-secondary p-1.5 rounded-xl h-auto">
                        <TabsTrigger value="all" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-soft font-medium">
                            All ({allDocuments.length})                                 {/* All Tab */}
                        </TabsTrigger>
                        <TabsTrigger value="invoices" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-soft font-medium">
                            Invoices ({invoices.length})                                {/* Invoice Tab */}
                        </TabsTrigger>
                        <TabsTrigger value="receipts" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-soft font-medium">
                            Receipts ({receipts.length})                                {/* Recipts Tab */}
                        </TabsTrigger>
                        <TabsTrigger value="itineraries" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-soft font-medium">
                            Itineraries ({itineraries.length})                          {/* Itineraries Tab */}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-0">                          {/* All Tab */}
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

                    <TabsContent value="invoices" className="mt-0">                     {/* Invoice Tab */}
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

                    <TabsContent value="receipts" className="mt-0">                     {/* Receipt Tab */}
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

                    <TabsContent value="itineraries" className="mt-0">                  {/* Itineraries Tab */}
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