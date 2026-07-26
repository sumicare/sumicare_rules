# syntax=docker/dockerfile:1
# escape=\

#   Copyright (c) 2026 Sumicare Contributors
#
#   Licensed under the terms of MIT License

{{ ContainerfileBaseArgs }}

ARG NODEJS_VERSION="{{ Version "nodejs" }}"
ARG GOLANG_VERSION="{{ Version "golang" }}"

# Frontend build stage - OpenCost UI
FROM --platform=$TARGETPLATFORM ${REPO}/${ORG}/nodejs:${NODEJS_VERSION} AS frontend

ARG HOMEDIR=/build
ARG BUILDER_UID=10000
ARG BUILDER_GID=100

WORKDIR ${HOMEDIR}/opencost-ui

ARG OPENCOST_UI_VERSION="{{ Version "opencost-ui" }}"
ARG OPENCOST_UI_REPO="{{ Repo "opencost-ui" }}"

#checkov:skip=CKV_DOCKER_4:it's a remote git repo
ADD --chown=${BUILDER_UID}:${BUILDER_GID} --keep-git-dir=false ${OPENCOST_UI_REPO}#v${OPENCOST_UI_VERSION} ${HOMEDIR}/opencost-ui

# Build frontend assets
RUN set -eux ; \
    npm ci --include=dev ; \
    npx parcel build src/index.html ; \
    rm -rf node_modules ; \
    cd .. ; \
    mv opencost-ui/dist ui ; \
    rm -rf opencost-ui ; \
    rm -rf ${HOMEDIR}/.cache

# Backend build stage - OpenCost
FROM --platform=$TARGETPLATFORM ${REPO}/${ORG}/golang:${GOLANG_VERSION} AS backend

ARG HOMEDIR=/build
ARG BUILDER_UID=10000
ARG BUILDER_GID=100

WORKDIR ${HOMEDIR}/opencost

ARG OPENCOST_VERSION="{{ Version "opencost" }}"
ARG OPENCOST_REPO="{{ Repo "opencost" }}"

#checkov:skip=CKV_DOCKER_4:it's a remote git repo
ADD --chown=${BUILDER_UID}:${BUILDER_GID} --keep-git-dir=false ${OPENCOST_REPO}#v${OPENCOST_VERSION} ${HOMEDIR}/opencost

# Copy built UI assets into the opencost source
COPY --from=frontend --chown=${BUILDER_UID}:${BUILDER_GID} ${HOMEDIR}/ui ${HOMEDIR}/opencost/ui/dist

# Build the binary
RUN set -eux ; \
    go mod download ; \
    cd cmd/costmodel ; \
    CGO_ENABLED=0 go build -a -installsuffix cgo \
        -ldflags "-s -w -X github.com/opencost/opencost/core/pkg/version.Version={{ Version "opencost" }}" \
        -o ${GOPATH}/bin/opencost . ; \
    upx --best --lzma --exact ${GOPATH}/bin/opencost ; \
    go clean -cache -modcache ; \
    cd ${HOMEDIR} ; \
    mkdir -p opencost-configs ; \
    cp opencost/configs/*.json opencost-configs/ ; \
    rm -rf opencost ; \
    mv ${GOPATH}/bin/opencost ${HOMEDIR} ; \
    rm -rf ${HOMEDIR}/.cache

FROM --platform=$TARGETPLATFORM ${REPO}/${ORG}/ubi_micro:${UBI_VERSION}

ARG HOMEDIR=/build

COPY --chown=0:0 --from=backend ${HOMEDIR}/opencost /usr/bin/opencost
COPY --chown=0:0 --from=backend ${HOMEDIR}/opencost-configs /etc/opencost
COPY --chown=0:0 --from=frontend  ${HOMEDIR}/ui /ui

USER nonroot

ENTRYPOINT ["/usr/bin/opencost"]
