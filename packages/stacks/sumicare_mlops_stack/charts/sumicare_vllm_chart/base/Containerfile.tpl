# syntax=docker/dockerfile:1
# escape=\

{{ GeneratedComment }}

{{ ContainerfileBaseArgs }}

ARG RUST_VERSION="{{ Version "rust" }}"
ARG GOLANG_VERSION="{{ Version "golang" }}"

FROM --platform=$TARGETPLATFORM ${REPO}/${ORG}/rust:${RUST_VERSION} AS xet_builder

ARG HOMEDIR=/build
ARG BUILDER_UID=10000
ARG BUILDER_GID=100

ARG RUST_VERSION

WORKDIR ${HOMEDIR}/ome

ARG OME_VERSION="{{ Version "ome" }}"
ARG OME_REPO="{{ Repo "ome" }}"

#checkov:skip=CKV_DOCKER_4:it's a remote git repo
ADD --chown=${BUILDER_UID}:${BUILDER_GID} --keep-git-dir=false ${OME_REPO}#v${OME_VERSION} ${HOMEDIR}/ome

ENV RUST_HOME="${HOMEDIR}/rust${RUST_VERSION}" \
    CARGO_HOME="${HOMEDIR}/.cargo" \
    CARGO_BUILD_JOBS="default"

ENV PATH="${RUST_HOME}/bin:${CARGO_HOME}/bin:${PATH}"

# Build libxet
RUN set -eux ; \
    cd pkg/xet ; \
    cargo build --release ; \
    rm -rf ~/.cargo/registry ~/.cargo/git ~/.rustup

FROM --platform=$TARGETPLATFORM ${REPO}/${ORG}/golang:${GOLANG_VERSION} AS build

ARG HOMEDIR=/build
ARG BUILDER_UID=10000
ARG BUILDER_GID=100

WORKDIR ${HOMEDIR}/ome

# Copy source with libxet built from rust stage
COPY --from=xet_builder --chown=${BUILDER_UID}:${BUILDER_GID} ${HOMEDIR}/ome ${HOMEDIR}/ome

ARG LD_FLAGS="-s -w"

# Build OME binaries
RUN set -eux ; \
    cd pkg/xet ; \
    cp target/release/libxet.a . ; \
    go build -ldflags="${LD_FLAGS} -extldflags '-L./'" . ; \
    cd ../.. ; \
    go build -ldflags="${LD_FLAGS}" -v -o ${GOPATH}/bin/manager ./cmd/manager ; \
    go build -ldflags="${LD_FLAGS}" -v -o ${GOPATH}/bin/model-agent ./cmd/model-agent ; \
    go build -ldflags="${LD_FLAGS}" -v -o ${GOPATH}/bin/ome-agent ./cmd/ome-agent ; \
    CGO_ENABLED=0 go build -ldflags="${LD_FLAGS} -extldflags '-static'" -v -o ${GOPATH}/bin/multinode-prober ./cmd/multinode-prober ; \
    upx --best --lzma --exact ${GOPATH}/bin/manager ; \
    upx --best --lzma --exact ${GOPATH}/bin/model-agent ; \
    upx --best --lzma --exact ${GOPATH}/bin/ome-agent ; \
    upx --best --lzma --exact ${GOPATH}/bin/multinode-prober ; \
    cd ../.. ; \
    rm -rf ome ; \
    go clean -cache -modcache ; \
    rm -rf ${GOPATH}/pkg ${GOPATH}/src

FROM --platform=$TARGETPLATFORM ${REPO}/${ORG}/ubi_micro:${UBI_VERSION}

ARG GOPATH=/build/go

COPY --chown=0:0 --from=build ${GOPATH}/bin/manager /usr/bin/manager
COPY --chown=0:0 --from=build ${GOPATH}/bin/model-agent /usr/bin/model-agent
COPY --chown=0:0 --from=build ${GOPATH}/bin/ome-agent /usr/bin/ome-agent
COPY --chown=0:0 --from=build ${GOPATH}/bin/multinode-prober /usr/bin/multinode-prober

USER nonroot

ENTRYPOINT ["/usr/bin/manager"]
