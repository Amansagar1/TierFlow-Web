'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Handle,
  Position,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Users,
  Network,
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  ChevronRight,
  User,
  ArrowUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '../../components/layout/AppLayout';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { referralsApi } from '../../features/referrals/referralsApi';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';

// ------------------------------ Custom React Flow Node Components ------------------------------

const RootNodeComponent = ({ data }) => {
  return (
    <div className="w-[290px] bg-white border-2 border-blue-400 rounded-2xl p-3.5 shadow-sm text-center relative select-none">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#0066FF] text-white flex items-center justify-center font-bold shadow-xs">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900 leading-tight">
              {data.name} (You)
            </h4>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{data.code}</p>
          </div>
        </div>
        <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
          Level 0
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1 pt-2.5 mt-2.5 border-t border-slate-100 text-center">
        <div>
          <p className="font-extrabold text-xs text-slate-900 leading-tight">{data.totalReferrals}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Total Referrals</p>
        </div>
        <div className="border-x border-slate-100">
          <p className="font-extrabold text-xs text-slate-900 leading-tight">{data.directReferrals}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Direct Referrals</p>
        </div>
        <div>
          <p className="font-extrabold text-xs text-slate-900 leading-tight">{formatINR(data.totalIncome)}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Total Income</p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !w-0 !h-0 !border-0 !bg-transparent"
      />
    </div>
  );
};

const Level1NodeComponent = ({ data }) => {
  return (
    <div className="w-[148px] bg-[#F0F6FF] border border-blue-200 rounded-2xl p-3 text-center shadow-xs select-none hover:border-blue-400 transition-colors">
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !w-0 !h-0 !border-0 !bg-transparent"
      />

      <div className="w-7 h-7 rounded-full bg-[#0066FF] text-white flex items-center justify-center mx-auto mb-1.5 shadow-2xs">
        <User className="w-3.5 h-3.5 text-white" />
      </div>
      <h5 className="font-bold text-xs text-slate-900 leading-tight">{data.name}</h5>
      <span className="bg-blue-100 text-blue-700 text-[9px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5">
        Level 1
      </span>
      <div className="mt-2 pt-2 border-t border-blue-200/60 text-[10px] space-y-0.5">
        <p className="text-slate-500 font-medium">{data.referrals} Referrals</p>
        <p className="font-extrabold text-slate-900">{formatINR(data.earned)} Earned</p>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !w-0 !h-0 !border-0 !bg-transparent"
      />
    </div>
  );
};

const Level2NodeComponent = ({ data }) => {
  return (
    <div className="w-[100px] bg-[#F0FDF4] border border-emerald-200 rounded-2xl p-2.5 text-center shadow-2xs select-none hover:border-emerald-400 transition-colors">
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !w-0 !h-0 !border-0 !bg-transparent"
      />

      <div className="w-6 h-6 rounded-full bg-[#00C48C] text-white flex items-center justify-center mx-auto mb-1 shadow-2xs">
        <User className="w-3 h-3 text-white" />
      </div>
      <h6 className="font-bold text-[11px] text-slate-900 leading-tight">{data.name}</h6>
      <span className="bg-emerald-100 text-emerald-700 text-[8px] font-semibold px-1.5 py-0.2 rounded-full inline-block mt-0.5">
        Level 2
      </span>
      <div className="mt-1.5 pt-1.5 border-t border-emerald-200/60 text-[9px] leading-tight">
        <p className="text-slate-500 font-medium">{data.referrals} Referrals</p>
        <p className="font-extrabold text-slate-900 mt-0.5">₹ {data.earned}</p>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !w-0 !h-0 !border-0 !bg-transparent"
      />
    </div>
  );
};

const Level3NodeComponent = ({ data }) => {
  return (
    <div className="w-[92px] bg-[#FAF5FF] border border-purple-200 rounded-2xl p-2 text-center shadow-2xs select-none hover:border-purple-400 transition-colors">
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !w-0 !h-0 !border-0 !bg-transparent"
      />

      <div className="w-5 h-5 rounded-full bg-[#7B2CBF] text-white flex items-center justify-center mx-auto mb-1 shadow-2xs">
        <User className="w-2.5 h-2.5 text-white" />
      </div>
      <h6 className="font-bold text-[10px] text-slate-900 leading-tight">{data.name}</h6>
      <span className="bg-purple-100 text-purple-700 text-[8px] font-semibold px-1.5 py-0.2 rounded-full inline-block mt-0.5">
        Level 3
      </span>
      <div className="mt-1 pt-1 border-t border-purple-200/60 text-[9px] leading-tight">
        <p className="text-slate-500 font-medium">{data.referrals} Referrals</p>
        <p className="font-extrabold text-slate-900 mt-0.5">₹ {data.earned}</p>
      </div>
    </div>
  );
};

// ------------------------------ React Flow Static Node Types ------------------------------
const nodeTypes = {
  rootNode: RootNodeComponent,
  level1Node: Level1NodeComponent,
  level2Node: Level2NodeComponent,
  level3Node: Level3NodeComponent,
};

function generateFlowFromTree(treeData, user) {
  if (!treeData || !treeData.root) {
    if (user) {
      return {
        nodes: [
          {
            id: 'root',
            type: 'rootNode',
            position: { x: 371, y: 20 },
            data: {
              name: user.fullName || 'User',
              code: user.referralCode || '',
              totalReferrals: 0,
              directReferrals: 0,
              totalIncome: 0,
            },
          },
        ],
        edges: [],
      };
    }
    return { nodes: [], edges: [] };
  }

  const { root, summary } = treeData;
  const nodes = [];
  const edges = [];

  nodes.push({
    id: 'root',
    type: 'rootNode',
    position: { x: 371, y: 20 },
    data: {
      name: root.fullName || user?.fullName || 'User',
      code: root.referralCode || user?.referralCode || '',
      totalReferrals: summary?.totalReferrals ?? root.totalReferrals ?? 0,
      directReferrals: summary?.directReferrals ?? root.directReferralsCount ?? 0,
      totalIncome: summary?.totalLevelIncome ?? root.totalLevelIncome ?? 0,
    },
  });

  const level1 = root.children || [];
  if (level1.length === 0) {
    return { nodes, edges };
  }

  const l1Positions = [
    { x: 64, y: 180 },
    { x: 316, y: 180 },
    { x: 568, y: 180 },
    { x: 820, y: 180 },
  ];

  const l2Positions = [
    { x: 30, y: 340 }, { x: 146, y: 340 },
    { x: 282, y: 340 }, { x: 398, y: 340 },
    { x: 534, y: 340 }, { x: 650, y: 340 },
    { x: 786, y: 340 }, { x: 902, y: 340 },
  ];

  const l3Positions = [
    { x: 34, y: 480 }, { x: 150, y: 480 },
    { x: 286, y: 480 }, { x: 402, y: 480 },
    { x: 654, y: 480 }, { x: 790, y: 480 },
  ];

  let l2Index = 0;
  let l3Index = 0;

  level1.forEach((l1Child, i) => {
    const l1Id = l1Child._id ? String(l1Child._id) : `u1_${i}`;
    const pos1 = l1Positions[i] || { x: 64 + i * 252, y: 180 };

    nodes.push({
      id: l1Id,
      type: 'level1Node',
      position: pos1,
      data: {
        name: l1Child.fullName || l1Child.email?.split('@')[0] || `user${i + 1}`,
        referrals: l1Child.directReferralsCount || 0,
        earned: l1Child.totalEarned || 0,
      },
    });

    edges.push({
      id: `e-root-${l1Id}`,
      source: 'root',
      target: l1Id,
      type: 'smoothstep',
      pathOptions: { borderRadius: 16 },
      style: { stroke: '#0066FF', strokeDasharray: '4 4', strokeWidth: 1.5 },
    });

    const level2 = l1Child.children || [];
    level2.forEach((l2Child) => {
      const l2Id = l2Child._id ? String(l2Child._id) : `u2_${l2Index}`;
      const pos2 = l2Positions[l2Index] || { x: 30 + l2Index * 116, y: 340 };
      l2Index++;

      nodes.push({
        id: l2Id,
        type: 'level2Node',
        position: pos2,
        data: {
          name: l2Child.fullName || l2Child.email?.split('@')[0] || `user${l2Index}`,
          referrals: l2Child.directReferralsCount || 0,
          earned: l2Child.totalEarned || 0,
        },
      });

      edges.push({
        id: `e-${l1Id}-${l2Id}`,
        source: l1Id,
        target: l2Id,
        type: 'smoothstep',
        pathOptions: { borderRadius: 12 },
        style: { stroke: '#00C48C', strokeDasharray: '4 4', strokeWidth: 1.5 },
      });

      const level3 = l2Child.children || [];
      level3.forEach((l3Child) => {
        const l3Id = l3Child._id ? String(l3Child._id) : `u3_${l3Index}`;
        const pos3 = l3Positions[l3Index] || { x: 34 + l3Index * 120, y: 480 };
        l3Index++;

        nodes.push({
          id: l3Id,
          type: 'level3Node',
          position: pos3,
          data: {
            name: l3Child.fullName || l3Child.email?.split('@')[0] || `user${l3Index}`,
            referrals: l3Child.directReferralsCount || 0,
            earned: l3Child.totalEarned || 0,
          },
        });

        edges.push({
          id: `e-${l2Id}-${l3Id}`,
          source: l2Id,
          target: l3Id,
          type: 'smoothstep',
          pathOptions: { borderRadius: 12 },
          style: { stroke: '#7B2CBF', strokeDasharray: '4 4', strokeWidth: 1.5 },
        });
      });
    });
  });

  return { nodes, edges };
}

// ------------------------------ Inner Flow Canvas Component ------------------------------
function TreeFlowCanvas({ dynamicNodes, dynamicEdges }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(dynamicNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(dynamicEdges || []);
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const [zoomPercent, setZoomPercent] = useState(100);

  useEffect(() => {
    if (dynamicNodes && dynamicNodes.length > 0) {
      setNodes(dynamicNodes);
    }
    if (dynamicEdges && dynamicEdges.length > 0) {
      setEdges(dynamicEdges);
    }
  }, [dynamicNodes, dynamicEdges, setNodes, setEdges]);

  const handleZoomIn = () => {
    zoomIn({ duration: 250 });
    setTimeout(() => {
      const z = Math.round(getZoom() * 100);
      setZoomPercent(z || 110);
    }, 260);
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 250 });
    setTimeout(() => {
      const z = Math.round(getZoom() * 100);
      setZoomPercent(z || 90);
    }, 260);
  };

  const handleResetZoom = () => {
    fitView({ padding: 0.08, duration: 300 });
    setZoomPercent(100);
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Referral Network Tree
          </h2>
          <p className="text-[11px] text-slate-400">
            Visual representation of your referral hierarchy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
              Level 1
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00C48C]" />
              Level 2
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#7B2CBF]" />
              Level 3
            </span>
          </div>

          <div className="flex items-center border border-slate-200 rounded-xl px-2 py-0.5 bg-white text-xs text-slate-600 shadow-2xs">
            <button
              onClick={handleZoomOut}
              className="px-1.5 py-0.5 hover:bg-slate-100 rounded text-slate-600 font-bold transition-colors cursor-pointer"
              title="Zoom Out"
            >
              -
            </button>
            <span className="text-[11px] font-semibold px-2 min-w-[42px] text-center text-slate-700">
              {zoomPercent}%
            </span>
            <button
              onClick={handleZoomIn}
              className="px-1.5 py-0.5 hover:bg-slate-100 rounded text-slate-600 font-bold transition-colors cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
            <span className="h-3 w-px bg-slate-200 mx-1" />
            <button
              onClick={handleResetZoom}
              className="px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div
        className="relative w-full rounded-2xl overflow-hidden mt-3 bg-gradient-to-b from-[#F8FAFC] to-white border border-slate-100/90 shadow-2xs"
        style={{ width: '100%', height: 610 }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          minZoom={0.4}
          maxZoom={1.6}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          panOnDrag={true}
          connectionLineType={ConnectionLineType.SmoothStep}
          proOptions={{ hideAttribution: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <Background color="#E2E8F0" gap={18} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}

// ------------------------------ Main Referral Tree Page Component ------------------------------
export default function ReferralTreePage() {
  const { user } = useAuth();
  const [treeData, setTreeData] = useState(null);
  const [directReferrals, setDirectReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customRefCode, setCustomRefCode] = useState('');

  // ------------------------------ Load Referral Tree Data ------------------------------
  useEffect(() => {
    async function loadData() {
      try {
        const [treeRes, directRes] = await Promise.all([
          referralsApi.getReferralTree(),
          referralsApi.getDirectReferrals().catch(() => ({ data: { data: [] } })),
        ]);
        if (treeRes.data?.data) {
          setTreeData(treeRes.data.data);
        }
        if (directRes.data?.data) {
          setDirectReferrals(directRes.data.data);
        }
      } catch (err) {
        console.error('Referral tree load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const referralCode = user?.referralCode || treeData?.root?.referralCode || customRefCode || '';
  const referralLink = referralCode ? `https://tierflow.com/register?ref=${referralCode}` : 'https://tierflow.com/register';

  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
    return generateFlowFromTree(treeData, user);
  }, [treeData, user]);

  const directList = useMemo(() => {
    if (directReferrals.length > 0) {
      return directReferrals.slice(0, 5).map((u, i) => ({
        name: u.fullName || u.email?.split('@')[0] || `User`,
        joined: `Joined ${formatDate(u.createdAt)}`,
        status: u.accountStatus || 'Active',
        avatarBg: i % 3 === 0 ? 'bg-[#0066FF]' : i % 3 === 1 ? 'bg-[#FF8A00]' : 'bg-[#00C48C]',
      }));
    }
    return [];
  }, [directReferrals]);

  const treeSummaryBreakdown = useMemo(() => {
    const b = treeData?.summary?.levelBreakdown || [];
    return [
      {
        level: 'Level 1 (Direct)',
        count: `${b[0]?.users ?? 0} Users`,
        amount: b[0]?.income ?? 0,
        dotColor: 'bg-[#0066FF]',
      },
      {
        level: 'Level 2',
        count: `${b[1]?.users ?? 0} Users`,
        amount: b[1]?.income ?? 0,
        dotColor: 'bg-[#00C48C]',
      },
      {
        level: 'Level 3',
        count: `${b[2]?.users ?? 0} Users`,
        amount: b[2]?.income ?? 0,
        dotColor: 'bg-[#7B2CBF]',
      },
    ];
  }, [treeData]);

  const totalReferrals = treeData?.summary?.totalReferrals ?? 0;
  const totalLevelIncome = treeData?.summary?.totalLevelIncome ?? 0;
  const directReferralsCount = treeData?.summary?.directReferrals ?? 0;
  const totalTeamSize = treeData?.summary?.totalTeamSize ?? (totalReferrals > 0 ? totalReferrals + 1 : 1);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportTree = () => {
    const exportPayload = {
      user: referralCode,
      nodes: flowNodes,
      edges: flowEdges,
      summary: treeSummaryBreakdown,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportPayload, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `tierflow_referral_tree_${referralCode}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Referral tree exported successfully!');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <AppLayout searchPlaceholder="Search users, investments, referrals...">
      <div className="space-y-4">
        {/* ------------------------------ Header & Actions ------------------------------ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Referral Tree
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              View your complete referral network and hierarchy.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
              <Link href="/dashboard" className="hover:text-slate-600 transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-500 font-medium">Referral Tree</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportTree}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Tree</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all shadow-xs cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-slate-600" />
              ) : (
                <Maximize2 className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* ------------------------------ Referral Metrics & KPI Cards ------------------------------ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#0066FF] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Total Referrals</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {totalReferrals}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{directReferralsCount} Direct &nbsp;|&nbsp; {totalReferrals - directReferralsCount} Indirect</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#00C48C] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-medium text-slate-500">Total Level Income</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {formatINR(totalLevelIncome)}
                </h3>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600">
                  <ArrowUp className="w-3 h-3 stroke-[2.5]" /> 18%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">From 3 levels</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#7B2CBF] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-medium text-slate-500">Direct Referrals</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {directReferralsCount}
                </h3>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600">
                  <ArrowUp className="w-3 h-3 stroke-[2.5]" /> 12%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Active downline members</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FF8A00] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Total Team Size</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {totalTeamSize}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">(You + {totalReferrals})</p>
            </div>
          </div>
        </div>

        {/* ------------------------------ Interactive Network Tree & Details ------------------------------ */}
        <div className="grid grid-cols-12 gap-3.5 sm:gap-4">
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
            <ReactFlowProvider>
              <TreeFlowCanvas dynamicNodes={flowNodes} dynamicEdges={flowEdges} />
            </ReactFlowProvider>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-3.5 sm:space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Your Referral Info
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-[11px] font-semibold text-blue-600 border border-slate-200 hover:bg-slate-50 rounded-lg px-2.5 py-0.5 transition-colors cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div>
                <p className="text-[10px] font-medium text-slate-500 mb-1">Your Referral Code</p>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                  <span className="font-extrabold text-slate-900 tracking-wider text-xs">
                    {referralCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    title="Copy Referral Code"
                  >
                    {copiedCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-2.5">
                <p className="text-[10px] font-medium text-slate-500 mb-1">Referral Link</p>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                  <span className="text-[11px] text-blue-600 font-medium truncate mr-2 font-mono">
                    {referralLink}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="p-1 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer shrink-0"
                    title="Copy Referral Link"
                  >
                    {copiedLink ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Direct Referrals ({directReferralsCount})
                </h3>
                <Link
                  href="/referral-income"
                  className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-2.5">
                {directList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No direct referrals yet.</p>
                ) : (
                  directList.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full ${item.avatarBg} text-white flex items-center justify-center shrink-0 shadow-2xs`}
                        >
                          <User className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.joined}</p>
                        </div>
                      </div>
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {item.status || 'Active'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-3">
                Tree Summary
              </h3>

              <div className="space-y-2">
                {treeSummaryBreakdown.map((item) => (
                  <div
                    key={item.level}
                    className="flex items-center justify-between text-xs py-0.5"
                  >
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                      <span className="font-medium">{item.level}</span>
                    </span>
                    <span className="font-semibold text-slate-800">{item.count}</span>
                    <span className="font-bold text-slate-900">
                      {formatINR(item.amount)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 my-3" />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Total Referrals</span>
                  <span className="font-bold text-slate-900">{totalReferrals} Users</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Total Level Income</span>
                  <span className="text-sm font-extrabold text-slate-900">{formatINR(totalLevelIncome)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Customize Referral Code"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            Set your customized unique referral identifier. This will update your sharing link across your network.
          </p>
          <Input
            label="Custom Referral Code"
            type="text"
            value={customRefCode}
            onChange={(e) => setCustomRefCode(e.target.value.toUpperCase())}
            placeholder="e.g. TFL123456"
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast.success('Referral code updated successfully!');
                setIsEditModalOpen(false);
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
