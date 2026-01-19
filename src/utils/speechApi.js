export const fetchSpeechTopics = async () => {
  // simulate network delay
  await new Promise((res) => setTimeout(res, 500))

  return [
    {
      id: 1,
      title: "Mental Health Awareness",
      content: `
Introduction:
Hook: Imagine smiling outside but fighting battles inside.
Definition: Mental health is our emotional and psychological well-being.

Body:
Description: Students face stress, anxiety, and pressure silently.
Evidence: WHO reports 1 in 4 people experience mental health issues.
Example: Exam failure leading to depression.

Conclusion:
Generalized: Caring for mental health is not weakness, it is wisdom.
`
    },
    {
      id: 2,
      title: "Women Safety in India",
      content: `
Introduction:
Hook: A woman checks time before stepping out.
Definition: Women safety means freedom without fear.

Body:
Description: Fear limits education and career growth.
Evidence: NCRB shows increasing harassment cases.
Example: Avoiding late travel due to insecurity.

Conclusion:
Generalized: Safety is a shared responsibility.
`
    },
    {
      id: 3,
      title: "Importance of Counselling",
      content: `
Introduction:
Hook: Sometimes listening heals more than advice.
Definition: Counselling helps understand emotions and choices.

Body:
Description: Students face academic and family pressure.
Evidence: Colleges with counselling show reduced dropouts.
Example: Career clarity through counselling sessions.

Conclusion:
Generalized: Asking for help is a strength.
`
    }
  ]
}
