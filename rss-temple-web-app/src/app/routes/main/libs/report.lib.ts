export interface ReasonOption {
  label: string;
  value: string;
}

// list stolen from reddit.com's report modal
export const CommonReasonOptions: ReasonOption[] = [
  {
    label: 'Harassment',
    value: '::Harassment::',
  },
  {
    label: 'Threatening violence',
    value: '::Threatening violence::',
  },
  {
    label: 'Hate',
    value: '::Hate::',
  },
  {
    label: 'Minor abuse or sexualization',
    value: '::Minor abuse or sexualization::',
  },
  {
    label: 'Sharing personal information',
    value: '::Sharing personal information::',
  },
  {
    label: 'Non-consensual intimate media',
    value: '::Non-consensual intimate media::',
  },
  {
    label: 'Prohibited transaction',
    value: '::Prohibited transaction::',
  },
  {
    label: 'Impersonation',
    value: '::Impersonation::',
  },
  {
    label: 'Copyright violation',
    value: '::Copyright violation::',
  },
  {
    label: 'Trademark violation',
    value: '::Trademark violation::',
  },
  {
    label: 'Self-harm or suicide',
    value: '::Self-harm or suicide::',
  },
  {
    label: 'Spam',
    value: '::Spam::',
  },
];

export const OtherReason: ReasonOption = {
  label: 'Other…',
  value: '',
};
