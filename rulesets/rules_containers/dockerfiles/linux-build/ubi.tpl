# syntax=docker/dockerfile:1
# escape=\

{{ ContainerfileBaseArgs }}

FROM --platform=$TARGETPLATFORM ${REPO}/${ORG}/ubi:$UBI_VERSION

ARG TARGETARCH

ARG ROOT_FS="/rootfs"
ARG UBI_RELEASE_VER=10

ARG BUILD_DEPS="gcc gcc-c++ gdb libxcrypt-devel openssl-devel glibc-static mailcap bzip2 which diffutils m4"
ARG PYTHON_BUILD_DEPS="zlib-devel libzstd-devel libffi-devel bzip2-devel xz-devel sqlite-devel libuuid-devel gdbm-libs expat-devel mpdecimal xz-devel python3-pip python3-devel"
ARG NODE_BUILD_DEPS="libuv brotli-devel libicu-devel"
ARG RUST_BUILD_DEPS="llvm-filesystem llvm-libs cmake llvm llvm-devel ninja-build ncurses-devel"
ARG BPF_BUILD_DEPS="clang elfutils-libelf-devel kernel-headers protobuf"
ARG POSTGRES_BUILD_DEPS="liburing-devel libxml2-devel libxslt-devel openldap-devel lz4-devel libuuid-devel cyrus-sasl-gssapi cyrus-sasl-devel krb5-devel libselinux-devel gettext perl-FindBin perl-File-Compare perl-File-Copy perl-version libevent-devel"

ARG BUILDER_UID=10000
ARG BUILDER_GID=100 # default users group
ARG BUILDER_USER="developer"

ARG HOMEDIR=/build

ENV PATH="/usr/sbin:/sbin:${PATH}"

RUN set -eux ; \
    rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release ; \
    microdnf update -y ; \
    microdnf install --releasever ${UBI_RELEASE_VER} --setopt=install_weak_deps=0 --nodocs -y \
    zsh git xz tar unzip shadow-utils \
    ${BUILD_DEPS} \
    ${PYTHON_BUILD_DEPS} \
    ${NODE_BUILD_DEPS} \
    ${RUST_BUILD_DEPS} \
    ${BPF_BUILD_DEPS} \
    ${POSTGRES_BUILD_DEPS} ; \
    microdnf clean all ; \
    find /usr -name '*.pyc' -type f -exec rm -vf '{}' + 2>/dev/null || true ; \
    find /usr -name '__pycache__' -type d -exec rm -rf '{}' + 2>/dev/null || true ; \
    rm -rf /var/cache/* /var/log/dnf* /var/log/yum.* ; \
    rm -rf /tmp/* ; \
    mkdir ${HOMEDIR} ; \
    useradd --shell /bin/zsh -l -m -d ${HOMEDIR} -u ${BUILDER_UID} -g ${BUILDER_GID} ${BUILDER_USER} ; \
    chown -R ${BUILDER_UID}:${BUILDER_GID} ${HOMEDIR} ; \
    su - ${BUILDER_USER} -c 'curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh | sh -s -- --unattended'

{{ $upxVersion := Version "upx" }}
ARG UPX_VERSION="{{ $upxVersion }}"
ARG UPX_SRC_SHA256="{{ UPXSourceHash $upxVersion }}"
ARG UPX_URL="https://github.com/upx/upx/releases/download/v${UPX_VERSION}/upx-${UPX_VERSION}-src.tar.xz"
ARG UPX_INSTALL_PREFIX="/usr"

RUN set -eux ; \
    curl -fsSL -o ${HOMEDIR}/upx-src.tar.xz "${UPX_URL}" ; \
    echo "${UPX_SRC_SHA256}  ${HOMEDIR}/upx-src.tar.xz" | sha256sum -c - ; \
    mkdir -p ${HOMEDIR}/upx-src ; \
    tar -xf ${HOMEDIR}/upx-src.tar.xz -C ${HOMEDIR}/upx-src --strip-components=1 ; \
    chown -R ${BUILDER_UID}:${BUILDER_GID} ${HOMEDIR}/upx-src ; \
    cd ${HOMEDIR}/upx-src ; \
    su ${BUILDER_USER} -c 'cmake -B build -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=${UPX_INSTALL_PREFIX}' ; \
    su ${BUILDER_USER} -c 'cmake --build build -j$(nproc)' ; \
    cmake --install build ; \
    cd / ; \
    rm -rf ${HOMEDIR}/upx-src* ; \
    upx --version

{{ $bpftoolVersion := Version "bpftool" }}
ARG BPFTOOL_VERSION="{{ $bpftoolVersion }}"
ARG BPFTOOL_SHA256_AMD64="{{ BpftoolAmd64SHA256 $bpftoolVersion }}"
ARG BPFTOOL_SHA256_ARM64="{{ BpftoolArm64SHA256 $bpftoolVersion }}"

RUN set -eux ; \
    case "${TARGETARCH}" in \
    amd64) BPFTOOL_SHA256="${BPFTOOL_SHA256_AMD64}" ;; \
    arm64) BPFTOOL_SHA256="${BPFTOOL_SHA256_ARM64}" ;; \
    *) echo "Unsupported architecture: ${TARGETARCH}" >&2 ; exit 1 ;; \
    esac ; \
    curl -sSLo /tmp/bpftool.tar.gz \
        https://github.com/libbpf/bpftool/releases/download/v${BPFTOOL_VERSION}/bpftool-v${BPFTOOL_VERSION}-${TARGETARCH}.tar.gz ; \
    echo "${BPFTOOL_SHA256}  /tmp/bpftool.tar.gz" | sha256sum -c - ; \
    tar -xzf /tmp/bpftool.tar.gz -C /usr/bin ; \
    chown 0:0 /usr/bin/bpftool ; \
    chmod +x /usr/bin/bpftool ; \
    rm /tmp/bpftool.tar.gz ; \
    bpftool version

{{ $protocVersion := Version "protoc" }}
ARG PROTOC_VERSION="{{ $protocVersion }}"
ARG PROTOC_SHA256_AMD64="{{ ProtocAmd64SHA256 $protocVersion }}"
ARG PROTOC_SHA256_ARM64="{{ ProtocArm64SHA256 $protocVersion }}"

RUN set -eux ; \
    case "${TARGETARCH}" in \
    amd64) PROTOC_ARCH="x86_64" ; PROTOC_SHA256="${PROTOC_SHA256_AMD64}" ;; \
    arm64) PROTOC_ARCH="aarch_64" ; PROTOC_SHA256="${PROTOC_SHA256_ARM64}" ;; \
    *) echo "Unsupported architecture: ${TARGETARCH}" >&2 ; exit 1 ;; \
    esac ; \
    curl -sSLo /tmp/protoc.zip \
        https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/protoc-${PROTOC_VERSION}-linux-${PROTOC_ARCH}.zip ; \
    echo "${PROTOC_SHA256}  /tmp/protoc.zip" | sha256sum -c - ; \
    unzip -q /tmp/protoc.zip -d /usr bin/protoc 'include/*' ; \
    chown 0:0 /usr/bin/protoc ; \
    chmod +x /usr/bin/protoc ; \
    rm /tmp/protoc.zip ; \
    protoc --version

{{ $jemallocVersion := Version "jemalloc" }}
ARG JEMALLOC_VERSION="{{ $jemallocVersion }}"
ARG JEMALLOC_SRC_SHA256="{{ JemallocSourceHash $jemallocVersion }}"

RUN set -eux ; \
    curl -sSLo /tmp/jemalloc.tar.bz2 \
        https://github.com/jemalloc/jemalloc/releases/download/${JEMALLOC_VERSION}/jemalloc-${JEMALLOC_VERSION}.tar.bz2 ; \
    echo "${JEMALLOC_SRC_SHA256}  /tmp/jemalloc.tar.bz2" | sha256sum -c - ; \
    mkdir -p /tmp/jemalloc-src ; \
    tar -xjf /tmp/jemalloc.tar.bz2 -C /tmp/jemalloc-src --strip-components=1 --no-same-owner ; \
    chown -R ${BUILDER_UID}:${BUILDER_GID} /tmp/jemalloc-src ; \
    cd /tmp/jemalloc-src ; \
    su ${BUILDER_USER} -c './configure --prefix=/usr --libdir=/usr/lib64' ; \
    su ${BUILDER_USER} -c 'make -j$(nproc)' ; \
    make install ; \
    ldconfig ; \
    cd / ; \
    rm -rf /tmp/jemalloc*

{{ $libbpfVersion := Version "libbpf" }}
ARG LIBBPF_VERSION="{{ $libbpfVersion }}"
ARG LIBBPF_SRC_SHA256="{{ LibbpfSourceHash $libbpfVersion }}"

RUN set -eux ; \
    curl -sSLo /tmp/libbpf.tar.gz \
        https://github.com/libbpf/libbpf/archive/refs/tags/v${LIBBPF_VERSION}.tar.gz ; \
    echo "${LIBBPF_SRC_SHA256}  /tmp/libbpf.tar.gz" | sha256sum -c - ; \
    mkdir -p /tmp/libbpf-src ; \
    tar -xzf /tmp/libbpf.tar.gz -C /tmp/libbpf-src --strip-components=1 ; \
    cd /tmp/libbpf-src/src ; \
    make install_headers INCLUDEDIR=/usr/include PREFIX=/usr LIBDIR=/usr/lib64 ; \
    cd / ; \
    rm -rf /tmp/libbpf*

WORKDIR ${HOMEDIR}
