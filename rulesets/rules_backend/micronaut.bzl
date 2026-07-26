"""Shared build macros for Micronaut modules.

Provides `micronaut_library` and `micronaut_application` wrappers around
`kt_jvm_library` / `kt_jvm_binary` that automatically wire up:

- KSP processor (io.micronaut:micronaut-inject-kotlin)
- Allopen compiler plugin (opens classes annotated with Micronaut stereotypes)
- Common Micronaut dependencies from the BOM
"""

load("@rules_kotlin//kotlin:core.bzl", "kt_ksp_plugin")
load("@rules_kotlin//kotlin:jvm.bzl", "kt_jvm_binary", "kt_jvm_library")

# ─── KSP plugin definitions ────────────────────────────────────────────────────
# Micronaut KSP has two processor providers discovered via ServiceLoader:
#   1. io.micronaut.kotlin.processing.visitor.TypeElementSymbolProcessorProvider
#      — processes type elements, configuration properties, AOP interceptors
#   2. io.micronaut.kotlin.processing.beans.BeanDefinitionProcessorProvider
#      — generates bean definition classes ($Definition classes)
# rules_kotlin's kt_ksp_plugin requires an explicit processor_class.

def _declare_micronaut_ksp(name = "micronaut_ksp"):
    kt_ksp_plugin(
        name = name + "_beans",
        processor_class = "io.micronaut.kotlin.processing.beans.BeanDefinitionProcessorProvider",
        deps = [
            "@maven//:io_micronaut_micronaut_inject_kotlin",
            "@maven//:io_micronaut_micronaut_inject",
            "@maven//:io_micronaut_micronaut_context",
            "@maven//:io_micronaut_micronaut_aop",
            "@maven//:io_micronaut_micronaut_core",
        ],
        generates_java = True,
    )
    kt_ksp_plugin(
        name = name + "_visitor",
        processor_class = "io.micronaut.kotlin.processing.visitor.TypeElementSymbolProcessorProvider",
        deps = [
            "@maven//:io_micronaut_micronaut_inject_kotlin",
            "@maven//:io_micronaut_micronaut_inject",
            "@maven//:io_micronaut_micronaut_context",
            "@maven//:io_micronaut_micronaut_aop",
            "@maven//:io_micronaut_micronaut_core",
        ],
        generates_java = True,
    )

# ─── Allopen annotations ───────────────────────────────────────────────────────
# These are the annotations that the allopen plugin will make classes open for.
# Mirrors the Micronaut Gradle plugin's default allopen configuration.

_ALLOPEN_ANNOTATIONS = [
    "io.micronaut.context.annotation.Singleton",
    "io.micronaut.context.annotation.Factory",
    "io.micronaut.context.annotation.Prototype",
    "io.micronaut.context.annotation.RequestScope",
    "io.micronaut.runtime.context.scope.Refreshable",
    "io.micronaut.runtime.context.scope.Infrastructure",
    "io.micronaut.runtime.context.scope.ThreadLocal",
    "io.micronaut.context.annotation.Context",
    "io.micronaut.aop.InterceptorBean",
    "io.micronaut.aop.Around",
    "io.micronaut.aop.Introduction",
    "io.micronaut.validation.Validated",
    "io.micronaut.runtime.Application",
]

# ─── micronaut_library ─────────────────────────────────────────────────────────

def micronaut_library(
        name,
        srcs = None,
        deps = None,
        resources = None,
        test_srcs = None,
        test_deps = None,
        visibility = ["//visibility:public"],
        **kwargs):
    """Wraps kt_jvm_library with Micronaut KSP and allopen configuration.

    Args:
        name: Target name.
        srcs: Kotlin source files (glob).
        deps: Additional dependencies.
        resources: Resource files.
        test_srcs: Test source files (optional).
        test_deps: Test-specific dependencies.
        visibility: Target visibility.
        **kwargs: Passed through to kt_jvm_library.
    """
    _declare_micronaut_ksp(name = name + "_ksp")

    all_deps = list(deps or [])
    all_deps.extend([
        "@maven//:org_jetbrains_kotlin_kotlin_stdlib",
    ])

    kt_jvm_library(
        name = name,
        srcs = srcs or [],
        deps = all_deps,
        resources = resources or [],
        plugins = [name + "_ksp_beans", name + "_ksp_visitor"],
        visibility = visibility,
        **kwargs
    )

    if test_srcs:
        kt_jvm_library(
            name = name + "_test",
            srcs = test_srcs,
            deps = all_deps + [":" + name] + (test_deps or []),
            testonly = True,
            visibility = ["//visibility:public"],
        )

# ─── micronaut_application ─────────────────────────────────────────────────────

def micronaut_application(
        name,
        main_class,
        srcs = None,
        deps = None,
        resources = None,
        runtime_deps = None,
        test_srcs = None,
        test_deps = None,
        visibility = ["//visibility:public"],
        **kwargs):
    """Wraps kt_jvm_binary with Micronaut KSP and allopen configuration.

    Produces an executable JAR with the given main class, wired with the
    Micronaut KSP processor for bean definition generation.

    Args:
        name: Target name.
        srcs: Kotlin source files (glob).
        deps: Compile-time dependencies.
        resources: Resource files (application.yml, etc.).
        main_class: Fully-qualified main class (e.g. "sumicare.auth.ApplicationKt").
        runtime_deps: Runtime-only dependencies (logback, snakeyaml, etc.).
        test_srcs: Test source files (optional).
        test_deps: Test-specific dependencies.
        visibility: Target visibility.
        **kwargs: Passed through to kt_jvm_binary.
    """
    _declare_micronaut_ksp(name = name + "_ksp")

    all_deps = list(deps or [])
    all_deps.extend([
        "@maven//:org_jetbrains_kotlin_kotlin_stdlib",
    ])

    kt_jvm_library(
        name = name + "_lib",
        srcs = srcs or [],
        deps = all_deps,
        resources = resources or [],
        plugins = [name + "_ksp_beans", name + "_ksp_visitor"],
        visibility = ["//visibility:public"],
    )

    kt_jvm_binary(
        name = name,
        main_class = main_class,
        runtime_deps = [":" + name + "_lib"] + (runtime_deps or []),
        visibility = visibility,
    )

    if test_srcs:
        kt_jvm_library(
            name = name + "_test",
            srcs = test_srcs,
            deps = all_deps + [":" + name + "_lib"] + (test_deps or []),
            testonly = True,
            visibility = ["//visibility:public"],
        )
