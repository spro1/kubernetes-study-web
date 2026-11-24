// 학습 트랙과 레슨 순서. 사이드바(sidebars.js)·진도 표시·랜딩 페이지가 모두 이 목록을 쓴다.
// 레슨을 추가하면 여기와 docs/index.mdx(카드 목록)에 넣는다.
module.exports = [
  {dir: 'cloud', color: '#0b7bb5', ko: '클라우드 기초', en: 'Cloud basics',
    lessons: ['service-models', 'vpc-request', 'az-failover', 'auto-scaling-group', 'iam-request']},
  {dir: 'basic', color: '#b0670c', ko: '기초 흐름', en: 'Foundations',
    lessons: ['web-request', 'https-cert', 'server-to-container', 'container-image', 'desired-state', 'workload-types', 'git-merge-request', 'cicd-pipeline']},
  {dir: 'k8s', color: '#2f62c9', ko: '쿠버네티스는 이렇게 움직인다', en: 'How Kubernetes works',
    lessons: ['pod-startup', 'traffic', 'rolling-update', 'autoscaling', 'self-healing', 'config-secret', 'storage-volume', 'service-dns', 'network-policy', 'rbac', 'job-cronjob', 'scheduling', 'node-drain', 'dra']},
  {dir: 'feature', color: '#0f8b8d', ko: '네트워크·서비스 메시·자원', en: 'Networking, mesh & resources',
    lessons: ['service-types', 'ingress', 'mesh-sidecar', 'mesh-traffic', 'mesh-gateway', 'entry-compare', 'namespace-quota', 'gpu-sharing', 'vpa']},
  {dir: 'intermediate', color: '#7c3aed', ko: '중급 흐름', en: 'Intermediate',
    lessons: ['probes', 'requests-limits', 'troubleshoot-status', 'graceful-shutdown', 'statefulset', 'gitops-sync']},
  {dir: 'advanced', color: '#c2410c', ko: '고급 흐름', en: 'Advanced',
    lessons: ['api-request-path', 'deletion-finalizer', 'crd-operator', 'etcd-quorum', 'cluster-cert', 'packet-path', 'volume-binding', 'priority-preemption', 'pod-security', 'supply-chain', 'audit-log', 'slo-alert']},
  {dir: 'cert', color: '#c03a5b', ko: '자격증 대비 흐름', en: 'Certification prep',
    lessons: ['kubeadm-upgrade', 'node-troubleshoot', 'kustomize', 'deploy-strategies', 'multi-container', 'runtime-security', 'threat-model']},
];
