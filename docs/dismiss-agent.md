# Dismiss agents (fork customization)

This fork adds **Dismiss agent** to each agent's details panel in the office.
Click an agent, choose **Dismiss agent**, and its character follows the existing
walk-out path to the door. Dismissal hides that session from the office and the
session list without stopping the AI agent or deleting its transcript.

Dismissals persist in this browser's local storage under
`wmad.dismissedSessions`; other browsers and browser profiles have their own
preferences. The Settings menu includes **Restore dismissed agents**. If a
dismissed session produces a new active event (thinking, tool execution, writing,
waiting, or error), it automatically returns. Simply refreshing the page does
not restore the dismissed session.

For a local check run:

```sh
node --test tests/dismissals.test.js
```

This optional fork feature does not install anything into Claude Code, Codex,
or another workspace by itself.
