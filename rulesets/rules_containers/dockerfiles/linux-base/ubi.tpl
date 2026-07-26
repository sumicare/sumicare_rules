# syntax=docker/dockerfile:1
# escape=\

{{ ContainerfileBaseArgs }}

FROM registry.access.redhat.com/ubi10:$UBI_VERSION AS builder


ENV LANG='C.UTF-8' \
    LC_ALL='C.UTF-8' \
    LANGUAGE='C' \
    TZ='UTC'

ARG ROOT_FS="/rootfs"
ARG UBI_RELEASE_VER=10

ARG BASE_PACKAGES="bash coreutils-single curl-minimal glibc-minimal-langpack langpacks-en libcurl-minimal libusb1 microdnf rootfiles tzdata openssl ca-certificates"

RUN mkdir -p ${ROOT_FS} ; \
    dnf install --installroot ${ROOT_FS} redhat-release --releasever ${UBI_RELEASE_VER} --setopt=install_weak_deps=false --nodocs --nogpgcheck -y ; \
    rpmkeys --root=${ROOT_FS} --import ${ROOT_FS}/etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release ; \
    dnf install --installroot ${ROOT_FS} --setopt=reposdir=/etc/yum.repos.d/ ${BASE_PACKAGES} --releasever ${UBI_RELEASE_VER} --setopt=install_weak_deps=false --nodocs -y ; \
    dnf --installroot ${ROOT_FS} clean all ; \
    rm -f ${ROOT_FS}/usr/share/gnupg/help*.txt ; \
    rm -f ${ROOT_FS}/etc/systemd/system/multi-user.target.wants/rhsmcertd.service ; \
    rm -rfv ${ROOT_FS}/usr/lib/systemd ; \
    rm -rf ${ROOT_FS}/var/cache/* ${ROOT_FS}/var/log/dnf* ${ROOT_FS}/var/log/yum.* ${ROOT_FS}/var/lib/rhsm ${ROOT_FS}/etc/pki/entitlement-host ; \
    ln -sf /run/secrets/etc-pki-entitlement ${ROOT_FS}/etc/pki/entitlement-host ; \
    ln -sf /run/secrets/rhsm ${ROOT_FS}/etc/rhsm-host ; \
    echo "%_install_langs ${LANG}" > ${ROOT_FS}/etc/rpm/macros.image-language-conf ; \
    echo "LANG=${LANG}" > ${ROOT_FS}/etc/locale.conf ; \
    rm -f ${ROOT_FS}/etc/sysconfig/network-scripts/ifcfg-* ; \
    rm -f ${ROOT_FS}/etc/machine-id ; \
    touch ${ROOT_FS}/etc/machine-id ; \
    chmod 0444 ${ROOT_FS}/etc/machine-id ; \
    rm -f ${ROOT_FS}/etc/yum.repos.d/redhat.repo ; \
    install -d ${ROOT_FS}/run/lock -m 0755 -o root -g root ; \
    systemd-tmpfiles --root=${ROOT_FS} --create /usr/lib/tmpfiles.d/rootfiles.conf ; \
    find ${ROOT_FS}/usr -name '*.pyc' -type f -exec rm -vf '{}' + 2>/dev/null || true ; \
    find ${ROOT_FS}/usr -name '__pycache__' -type d -exec rm -rf '{}' + 2>/dev/null || true 

FROM scratch

ENV LANG='C.UTF-8' \
    LC_ALL='C.UTF-8' \
    LANGUAGE='C' \
    TZ='UTC'

ARG ROOT_FS="/rootfs"
{{ ContainerfileBaseArgs }}
ARG UBI_RELEASE_VER=10

LABEL maintainer="sumi.care"
LABEL vendor="sumi.care"
LABEL url="https://${REPO}"
LABEL name="${REPO}/${ORG}/ubi:${UBI_RELEASE_VER}" \
    version="${UBI_VERSION}"

COPY --from=builder ${ROOT_FS}/ /
COPY --from=builder /etc/yum.repos.d/ubi.repo /etc/yum.repos.d/
