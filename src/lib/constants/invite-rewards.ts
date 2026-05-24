/** 邀请盲盒奖池（服务端只发放灵感额度，避免「公式卡/内容包」无实际权益） */
export const INVITE_BLIND_BOX_REWARDS = [
  { type: "quota" as const, label: "+5 灵感", amount: 5 },
  { type: "quota" as const, label: "+8 灵感", amount: 8 },
  { type: "quota" as const, label: "+10 灵感", amount: 10 },
  { type: "quota" as const, label: "+15 灵感", amount: 15 },
];

export function rollInviteBlindBoxReward() {
  return INVITE_BLIND_BOX_REWARDS[
    Math.floor(Math.random() * INVITE_BLIND_BOX_REWARDS.length)
  ];
}
