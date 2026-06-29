import { useState } from 'react';
import { DashboardLayout } from '@/features/agency/components/dashboard/DashboardLayout';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2, Send, Database, UserPlus, Package } from 'lucide-react';

const BASE_URL = 'http://localhost:8082/api/v1';

// ── Utility: run a test step and return result ──────────────────────────────
async function runTest(label, fn) {
  try {
    const result = await fn();
    return { label, status: 'pass', detail: result };
  } catch (err) {
    return { label, status: 'fail', detail: err.message };
  }
}

const TestPage = () => {
  const [agentId, setAgentId] = useState('');
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [newAgent, setNewAgent] = useState(null);

  // ── 1. Create a brand new test agent via the backend helper ────────────────
  const handleCreateAgent = async () => {
    setCreatingAgent(true);
    try {
      const res = await fetch(`${BASE_URL}/test/create-agent`);
      const text = await res.text();
      // Expected response: "Created User ID: X, Created Agent ID: Y"
      const userMatch = text.match(/User ID:\s*(\d+)/);
      const agentMatch = text.match(/Agent ID:\s*(\d+)/);
      if (!agentMatch) throw new Error('Unexpected response: ' + text);
      const extractedAgentId = agentMatch[1];
      const extractedUserId = userMatch?.[1] ?? '?';
      setNewAgent({ userId: extractedUserId, agentId: extractedAgentId });
      setAgentId(extractedAgentId);
      toast.success(`Agent created! User ID=${extractedUserId}, Agent ID=${extractedAgentId}`);
    } catch (err) {
      toast.error('Failed to create agent: ' + err.message);
    } finally {
      setCreatingAgent(false);
    }
  };

  // ── 2. Run the full API health-check suite ─────────────────────────────────
  const handleRunTests = async () => {
    if (!agentId) {
      toast.error('Enter an Agent ID first (or click "Create Test Agent")');
      return;
    }
    setRunning(true);
    setResults([]);
    const id = agentId.trim();

    const tests = [
      runTest('Backend Health (GET /)', async () => {
        const r = await fetch('http://localhost:8082/');
        return `HTTP ${r.status}`;
      }),

      runTest(`Agent Profile (GET /agent/${id}/profile)`, async () => {
        const r = await fetch(`${BASE_URL}/agent/${id}/profile`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        return `agencyName="${d.agencyName ?? d.companyName ?? 'N/A'}"`;
      }),

      runTest(`Agent Packages (GET /agent/${id}/packages)`, async () => {
        const r = await fetch(`${BASE_URL}/agent/${id}/packages`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        const list = Array.isArray(d) ? d : d.data ?? [];
        return `${list.length} package(s) found`;
      }),

      runTest(`Agent Dashboard (GET /agent/${id}/dashboard)`, async () => {
        const r = await fetch(`${BASE_URL}/agent/${id}/dashboard`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        return `totalPackages=${d.totalPackages ?? 'N/A'}`;
      }),

      runTest(`Create Package (POST /agent/${id}/packages)`, async () => {
        const form = new FormData();
        form.append('data', JSON.stringify({
          name: 'Test Package ' + Date.now(),
          category: 'ADVENTURE',
          destination: 'Test Destination',
          district: 'Colombo',
          startPlace: 'Colombo',
          endPlace: 'Galle',
          duration: '3 Days',
          priceFrom: 100,
          priceTo: 500,
          isActive: true,

          days: [{ dayNumber: 1, title: 'Day 1', description: 'Test day', activities: ['Activity 1'] }],
        }));
        const r = await fetch(`${BASE_URL}/agent/${id}/packages`, { method: 'POST', body: form });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        return `Package created, ID=${d.id ?? d.packageId ?? JSON.stringify(d).slice(0, 60)}`;
      }),
    ];

    const settled = await Promise.allSettled(tests);
    const resolvedResults = await Promise.all(settled.map(s => s.value ?? s.reason));
    setResults(resolvedResults);
    setRunning(false);

    const failed = resolvedResults.filter(r => r.status === 'fail').length;
    if (failed === 0) toast.success('All tests passed! ✅');
    else toast.error(`${failed} test(s) failed.`);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="API Test Page" subtitle="Verify backend connectivity & new schema after migration">
      <div className="space-y-8 max-w-2xl">

        {/* ── Step 1: Create Test Agent ── */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <UserPlus className="h-5 w-5 text-primary" />
            Step 1 — Create a Test Agent in the Database
          </div>
          <p className="text-sm text-muted-foreground">
            This calls <code className="bg-muted px-1 rounded text-xs">/api/v1/test/create-agent</code> on the backend,
            which inserts a new <strong>User</strong> + <strong>Agency</strong> row using the new schema.
          </p>
          <Button onClick={handleCreateAgent} disabled={creatingAgent} className="gap-2">
            {creatingAgent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            {creatingAgent ? 'Creating...' : 'Create Test Agent'}
          </Button>

          {newAgent && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm space-y-1">
              <p>✅ <strong>User ID:</strong> {newAgent.userId}</p>
              <p>✅ <strong>Agent (Agency) ID:</strong> {newAgent.agentId}</p>
              <p className="text-muted-foreground text-xs mt-2">
                This Agent ID has been auto-filled below. You can also hardcode it in <code>api.js</code> as <code>AGENT_ID</code>.
              </p>
            </div>
          )}
        </div>

        {/* ── Step 2: Enter Agent ID ── */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Send className="h-5 w-5 text-primary" />
            Step 2 — Run API Tests
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent-id-input">Agent ID to test with</Label>
            <div className="flex gap-2">
              <Input
                id="agent-id-input"
                placeholder="e.g. 3"
                value={agentId}
                onChange={e => setAgentId(e.target.value)}
                className="w-40"
              />
              <Button onClick={handleRunTests} disabled={running} className="gap-2">
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                {running ? 'Running...' : 'Run All Tests'}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Step 3: Results ── */}
        {results.length > 0 && (
          <div className="rounded-xl border bg-card p-6 space-y-3">
            <p className="font-semibold text-lg">Test Results</p>
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-lg p-3 border text-sm ${
                  r.status === 'pass'
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}
              >
                {r.status === 'pass'
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  : <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
                <div>
                  <p className="font-medium">{r.label}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{r.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TestPage;
