# syntax=docker/dockerfile:1
# escape=\

#   Copyright (c) 2026 Sumicare Contributors
#
#   Licensed under the terms of MIT License

{{ GeneratedComment }}

ARG GOLANG_VERSION="{{ Version "golang" }}"

{{ ContainerfileGoBinary "nats" "v" "-o $GOPATH/bin/nats ." }}
