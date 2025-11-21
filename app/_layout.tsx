import { Stack } from "expo-router";
import { CreateRoutineFlowProvider } from "@/hooks/useCreateRoutineFlow";

export default function RootLayout() {
  return (
    <CreateRoutineFlowProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </CreateRoutineFlowProvider>
  );
}
