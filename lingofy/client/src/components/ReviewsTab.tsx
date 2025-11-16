import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";

export function ReviewsTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Reviews Manager</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                    <p className="text-muted-foreground">Reviews Table Placeholder</p>
                </div>
            </CardContent>
        </Card>
    );
}
