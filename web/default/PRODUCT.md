# Dot API

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

API consumers create keys, inspect available models and prices, monitor usage, and manage their balance. Administrators manage channels, users, routing and system settings.

## Product Purpose

Provide the existing new-api gateway functionality through the Dot API console. The interface must make real billing, key management and model access understandable without inventing backend capabilities.

## Capabilities and Constraints

- Preserve all existing functionality, routes, permissions, translations, real data and billing rules during visual migration.
- Ordinary users do not choose routing groups; API keys use default. Channel discounts, CNY billing and display currency preferences remain intact.
- Keep the embedded landing page and its existing console navigation bridge.
- Work on the current default console frontend, not the classic theme or external websites. The user explicitly excluded the original landing website from this redesign; preserve its original artwork, layout and behavior unchanged.
- Test locally; do not commit, push or deploy without a separate request.

## Brand Commitments

The user approved replacing custom UI artwork with their LayerLab GUI Pro - Simple Casual assets, primarily the dark family. Preserve original artwork and authored state characteristics, adapting composition, readability and interaction to Apple's HIG. Icons may replace redundant operation text, but never hide essential facts or accessible names. Preserve all protected new-api and QuantumNous attribution.

## Evidence on Hand

- User-provided GUI Pro - Simple CasualPSD 1.0.7.unitypackage, including sprites, prefabs, demo scene and PSD sources.
- Existing application code, local test data and existing regression tests.
- LayerLab official Simple Casual demo and GUI guide.

## Product Principles

1. A visual migration does not add or remove business capabilities.
2. Shared asset-backed components must carry the whole interface, including admin pages and transient states.
3. Real values and understandable actions take precedence over game decoration.

## Accessibility & Inclusion

Apply HIG-informed hierarchy and feedback to the web: keyboard support, named icon actions, readable contrast, comfortable touch targets, reduced motion and CJK font fallback. Keep existing internationalization support.
