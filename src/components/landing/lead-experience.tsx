"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ConversationalLeadChat,
  type ChatSimulationContext,
} from "@/components/forms/conversational-lead-chat";
import { SavingsCalculatorSection } from "@/components/landing/savings-calculator-section";
import { siteContent as c } from "@/content/landing-page";
import {
  type AnalysisHorizon,
  type SavingsSimulation,
  calculateProjectedSpend,
} from "@/lib/savings-calculator";
import { OPEN_LEAD_CHAT_EVENT } from "@/lib/chat-events";

export function LeadExperience() {
  const [monthlyBill, setMonthlyBill] = useState<number>(
    c.calculator.slider.default,
  );
  const [horizon, setHorizon] = useState<AnalysisHorizon>(
    c.calculator.horizon.default,
  );
  const [calculation, setCalculation] = useState<SavingsSimulation | null>(
    null,
  );
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const openChat = () => setChatOpen(true);
    window.addEventListener(OPEN_LEAD_CHAT_EVENT, openChat);
    return () => window.removeEventListener(OPEN_LEAD_CHAT_EVENT, openChat);
  }, []);

  const saveCalculation = useCallback((simulation: SavingsSimulation) => {
    setCalculation(simulation);
  }, []);

  const chatSimulation = useMemo<ChatSimulationContext>(() => {
    const estimatedSpendWithoutSolar =
      calculation?.estimatedSpendWithoutSolar ??
      calculateProjectedSpend({ monthlyBill, years: horizon });

    return {
      monthlyBill: calculation?.monthlyBill ?? monthlyBill,
      analysisHorizon: calculation?.analysisHorizon ?? horizon,
      estimatedSpendWithoutSolar,
      fromCalculator: calculation !== null,
    };
  }, [calculation, horizon, monthlyBill]);

  return (
    <>
      <SavingsCalculatorSection
        monthlyBill={monthlyBill}
        horizon={horizon}
        onMonthlyBillChange={setMonthlyBill}
        onHorizonChange={setHorizon}
        onCalculation={saveCalculation}
        onOpenChat={() => setChatOpen(true)}
      />
      <ConversationalLeadChat
        open={chatOpen}
        onOpenChange={setChatOpen}
        simulation={chatSimulation}
      />
    </>
  );
}
