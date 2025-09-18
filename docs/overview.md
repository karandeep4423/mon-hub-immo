# Docs Overview

- collaboration-actions.md — Describes the collaboration details page actions, role permissions, and API wiring.

## Collaboration UI guards

- Activities and progress changes are disabled until a collaboration is `active`.
- The ProgressTracker's "Modifier le statut" and ActivityManager's "Ajouter une activité" controls are hidden/disabled when status is not `active`.
