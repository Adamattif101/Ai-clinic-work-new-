import { UK_HELPLINES } from '../lib/crisisDetection';

// Static signposting shown when the deterministic crisis layer flags input.
// This is signposting to EXISTING UK services only — never clinical advice.
export function CrisisBanner() {
  return (
    <div className="crisis-banner" role="alert">
      <h3>If you need to talk to someone now</h3>
      <p>You don't have to go through this alone. These UK services can help right away:</p>
      <ul>
        <li>
          <strong>{UK_HELPLINES.samaritans.name}</strong> —{' '}
          <a href="tel:116123">{UK_HELPLINES.samaritans.phone}</a>{' '}
          ({UK_HELPLINES.samaritans.note})
        </li>
        <li>
          <strong>{UK_HELPLINES.emergency.name}</strong> —{' '}
          <a href="tel:999">{UK_HELPLINES.emergency.phone}</a>{' '}
          ({UK_HELPLINES.emergency.note})
        </li>
        <li>
          <strong>{UK_HELPLINES.shout.name}</strong> — {UK_HELPLINES.shout.sms}{' '}
          ({UK_HELPLINES.shout.note})
        </li>
      </ul>
    </div>
  );
}
