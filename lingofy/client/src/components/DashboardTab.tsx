import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Download, QrCode } from "lucide-react";

export function DashboardTab() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Global Reach</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64 bg-muted rounded-md">
                        <p className="text-muted-foreground">World Map Placeholder</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Share Kit</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center w-48 h-48 bg-muted rounded-md">
                         <QrCode className="w-24 h-24 text-muted-foreground" />
                    </div>
                    <Button className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Share Card
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
