import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { HistoryRow } from "@/components/HistoryRow";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useSecurity } from "@/context/SecurityContext";
import { useColors } from "@/hooks/useColors";

export default function HistoryScreen() {
  const colors = useColors();
  const { history, clearHistory } = useSecurity();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Scan History
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {history.length} {history.length === 1 ? "scan" : "scans"} on this device
          </Text>
        </View>
        {history.length > 0 ? (
          <Pressable
            onPress={clearHistory}
            style={({ pressed }) => [
              styles.clear,
              {
                borderColor: colors.border,
                borderRadius: 999,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="trash-2" size={14} color={colors.destructive} />
            <Text
              style={[styles.clearText, { color: colors.destructive }]}
            >
              Clear
            </Text>
          </Pressable>
        ) : null}
      </View>

      {history.length === 0 ? (
        <Card>
          <View style={styles.empty}>
            <Feather name="clock" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No history yet
            </Text>
            <Text
              style={[styles.emptyText, { color: colors.mutedForeground }]}
            >
              Scans you run from the Scanner tab will be saved here, including
              the verdicts from every threat-intelligence source.
            </Text>
          </View>
        </Card>
      ) : (
        <View style={{ gap: 10 }}>
          {history.map((item) => (
            <HistoryRow
              key={item.id}
              result={item}
              onPress={() =>
                router.push({
                  pathname: "/scan-result",
                  params: { id: item.id },
                })
              }
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 4,
  },
  clear: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  clearText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  empty: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 24,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 18,
  },
});
