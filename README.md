<div align="center">

# K8s Flow

**See how Kubernetes actually works, one animated step at a time.**

What happens after `kubectl apply`? 61 interactive lessons take you from cloud basics to Kubernetes internals and CKA/CKAD/CKS topics. Each step shows which components join in and where each request travels.

### 👉 [Open the site: spro1.github.io/kubernetes-study-web](https://spro1.github.io/kubernetes-study-web/)

No install, no sign-up. English and 한국어.

![K8s Flow preview](static/img/social-card.png)

</div>

## Why

Kubernetes docs are full of sentences like "the API server writes to etcd, the controller watches and…". The order of events is hard to keep in your head from text alone.
K8s Flow draws that order. Each click brings in the next component and shows the request moving between them. Every step also gives the key idea, what to watch out for, and how state values change.

## What you get

- **Animated step-by-step diagrams.** Packets move along the real request path.
- **Autoplay.** Press <kbd>A</kbd> and the lesson plays like a short video.
- **Progress tracking.** Finished lessons get a ✓ in the sidebar and on the cards, and you can pick up where you left off. Progress stays in your browser, so there is no account.
- **English / 한국어**, dark mode, mobile layout, and support for reduced-motion settings.

## Tracks

| Track | Lessons | Covers |
| --- | :-: | --- |
| [Cloud basics](https://spro1.github.io/kubernetes-study-web/cloud/service-models) | 5 | IaaS/PaaS/SaaS, VPC request path, AZ failover, auto scaling groups, IAM |
| [Foundations](https://spro1.github.io/kubernetes-study-web/basic/web-request) | 8 | Web requests, HTTPS certificates, servers to containers, images, desired state, Git, CI/CD |
| [How Kubernetes works](https://spro1.github.io/kubernetes-study-web/k8s/pod-startup) | 14 | Pod startup, traffic, rolling updates, HPA, self-healing, ConfigMap/Secret, PVC, DNS, NetworkPolicy, RBAC, Jobs, scheduling, node drain, DRA |
| [Networking, mesh & resources](https://spro1.github.io/kubernetes-study-web/feature/service-types) | 9 | Service types, Ingress and TLS, Istio sidecars, traffic splitting and gateways, quotas, GPU sharing, VPA |
| [Intermediate](https://spro1.github.io/kubernetes-study-web/intermediate/probes) | 6 | Probes, requests and limits, reading Pod status, graceful shutdown, StatefulSets, GitOps |
| [Advanced](https://spro1.github.io/kubernetes-study-web/advanced/api-request-path) | 12 | API request path, finalizers, CRDs and operators, etcd quorum, certificates, packet path, volume binding, preemption, Pod security, supply chain, audit logs, SLO alerts |
| [Certification prep](https://spro1.github.io/kubernetes-study-web/cert/kubeadm-upgrade) | 7 | kubeadm upgrades, node troubleshooting, Kustomize, deployment strategies, multi-container Pods, runtime security, threat modeling |

## Contributing

Corrections, translations and new lesson ideas are all welcome. Open an [issue](https://github.com/spro1/kubernetes-study-web/issues) or send a PR.

Each lesson is a single MDX file: `docs/<track>/<lesson>.mdx` for English and `i18n/ko/docusaurus-plugin-content-docs/current/<track>/<lesson>.mdx` for Korean. A lesson is one `<StepDiagram nodes={...} steps={...} />` element with node positions and per-step flows. Copying an existing lesson is the fastest way to start. The component's props are documented at the top of [`src/components/StepDiagram.jsx`](src/components/StepDiagram.jsx), and the track order lives in [`src/data/tracks.js`](src/data/tracks.js).

```bash
npm install
npm start                 # English, http://localhost:3000/kubernetes-study-web/
npm start -- --locale ko  # Korean
```

Every push to `main` is built and deployed to GitHub Pages by GitHub Actions.

---

## 한국어

**쿠버네티스가 실제로 움직이는 모습을 단계별 애니메이션으로 배운다.** 클라우드 기초부터 쿠버네티스 내부, 자격증 범위까지 61개 레슨이 있다. 설치 없이 [한국어 사이트](https://spro1.github.io/kubernetes-study-web/ko/)에서 바로 볼 수 있다. 틀린 내용 제보와 레슨 제안은 이슈로 남겨 주세요.

---

<div align="center">

If K8s Flow helped you, a ⭐ **Star** helps others find it.

</div>
