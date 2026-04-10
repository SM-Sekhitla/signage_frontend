import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBookings, getPortfolioItems, getProfile, updateProfile, storeFile } from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Briefcase, Star, Image, ArrowLeft, FileText, Upload, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import InstallerSidebar from '@/components/installer/InstallerSidebar';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function InstallerDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [companyPortfolioUrl, setCompanyPortfolioUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bookingStats, setBookingStats] = useState<any[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = () => {
    if (!user) return;

    setPortfolioCount(getPortfolioItems(user.id).length);
    setPendingBookings(getBookings({ installer_id: user.id, status: 'pending' }).length);

    const profile = getProfile(user.id);
    setCompanyPortfolioUrl(profile?.company_portfolio_url || null);

    const allBookings = getBookings({ installer_id: user.id });

    const statusCounts = allBookings.reduce((acc: Record<string, number>, b: any) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});

    setStatusBreakdown([
      { name: 'Pending', value: statusCounts.pending || 0, fill: 'hsl(var(--chart-1))' },
      { name: 'Accepted', value: statusCounts.accepted || 0, fill: 'hsl(var(--chart-2))' },
      { name: 'Declined', value: statusCounts.declined || 0, fill: 'hsl(var(--chart-3))' },
      { name: 'Completed', value: statusCounts.completed || 0, fill: 'hsl(var(--chart-4))' },
    ].filter(s => s.value > 0));

    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ month: d.toLocaleDateString('en-US', { month: 'short' }), year: d.getFullYear(), monthNum: d.getMonth() });
    }

    setMonthlyTrend(months.map(m => ({
      month: m.month,
      bookings: allBookings.filter((b: any) => {
        const bd = new Date(b.created_at);
        return bd.getMonth() === m.monthNum && bd.getFullYear() === m.year;
      }).length
    })));

    setBookingStats([
      { status: 'Pending', count: statusCounts.pending || 0 },
      { status: 'Accepted', count: statusCounts.accepted || 0 },
      { status: 'Declined', count: statusCounts.declined || 0 },
      { status: 'Completed', count: statusCounts.completed || 0 },
    ]);
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File size must be less than 10MB'); return; }

    setUploading(true);
    try {
      const url = await storeFile(file);
      updateProfile(user.id, { company_portfolio_url: url });
      setCompanyPortfolioUrl(url);
      toast.success('Company portfolio uploaded successfully');
    } catch (error: any) {
      toast.error('Failed to upload portfolio');
    } finally {
      setUploading(false);
    }
  };

  const barChartConfig: ChartConfig = { count: { label: 'Bookings', color: 'hsl(var(--chart-1))' } };
  const lineChartConfig: ChartConfig = { bookings: { label: 'Bookings', color: 'hsl(var(--chart-2))' } };

  return (
    <div className="min-h-screen bg-background flex">
      <InstallerSidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <div className="h-14 md:hidden" />
        <header className="border-b bg-card hidden md:block">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="h-5 w-5" /></Button>
              <h1 className="text-xl md:text-2xl font-bold">Installer Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Button onClick={signOut} variant="outline" size="sm">Sign Out</Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Pending Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{pendingBookings}</div>
                <p className="text-xs text-muted-foreground hidden md:block">Awaiting response</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Active Projects</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{bookingStats.find(b => b.status === 'Accepted')?.count || 0}</div>
                <p className="text-xs text-muted-foreground hidden md:block">In progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Portfolio Items</CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{portfolioCount}</div>
                <p className="text-xs text-muted-foreground hidden md:block">Showcase projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">0.0</div>
                <p className="text-xs text-muted-foreground hidden md:block">From 0 reviews</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bookings Trend</CardTitle>
                <CardDescription>Monthly booking requests over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={lineChartConfig} className="h-[200px] w-full">
                  <LineChart data={monthlyTrend} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="bookings" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-2))' }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Booking Status</CardTitle>
                <CardDescription>Breakdown by status</CardDescription>
              </CardHeader>
              <CardContent>
                {statusBreakdown.length > 0 ? (
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                          {statusBreakdown.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">No booking data yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Bookings by Status</CardTitle>
              <CardDescription>Total count for each booking status</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={barChartConfig} className="h-[200px] w-full">
                <BarChart data={bookingStats} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="status" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Company Portfolio</CardTitle>
              <CardDescription>Upload your company portfolio as a PDF document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {companyPortfolioUrl ? (
                <div className="space-y-3">
                  <a href={companyPortfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-lg border bg-muted/50 hover:bg-muted transition-colors">
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="flex-1 font-medium">Company Portfolio.pdf</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                  <div className="flex gap-2">
                    <Label htmlFor="portfolio-replace" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">{uploading ? 'Uploading...' : 'Replace Portfolio'}</span>
                      </div>
                      <Input id="portfolio-replace" type="file" accept=".pdf" className="hidden" onChange={handlePortfolioUpload} disabled={uploading} />
                    </Label>
                  </div>
                </div>
              ) : (
                <Label htmlFor="portfolio-upload" className="cursor-pointer block">
                  <div className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-center">
                      <p className="font-medium">{uploading ? 'Uploading...' : 'Upload Portfolio PDF'}</p>
                      <p className="text-sm text-muted-foreground">Max file size: 10MB</p>
                    </div>
                  </div>
                  <Input id="portfolio-upload" type="file" accept=".pdf" className="hidden" onChange={handlePortfolioUpload} disabled={uploading} />
                </Label>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
