import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StatCardProps } from '@/types/dashboard';

export type { StatCardProps };

/**
 * Name Function: StatCard
 * Description: Summary metric indicator card rendering title, numeric/string value, brief description, and associated Lucide icon.
 * Reason: Presents primary metrics uniformly across all dashboard tabs in a clean responsive grid positioned above data tables.
 **/
export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export default StatCard;
