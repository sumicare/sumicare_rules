# syntax=docker/dockerfile:1
# escape=\

{{ ContainerfileBaseArgs }}

FROM registry.access.redhat.com/ubi10:$UBI_VERSION AS builder
