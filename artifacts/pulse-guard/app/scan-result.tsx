import { Feather } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScoreRing } from "@/components/ScoreRing";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useSecurity } from "@/context/SecurityContext";
import { useColors } from "@/hooks/useColors";
import { verdictColor, verdictLabel } from "@/lib/scanner";

export default function ScanResultScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ id: string }>();
  const { history } = useSecurity();
  const result = history.find((h) => h.id === params.id);

  if (!result) {
    return (
      <ScreenContainer>
        <Stack.Screen
          options={{ title: "Scan", headerStyle: { backgroundColor: colors.background } }}
        />
        <Card>
          <Text
            style={{
              color: colors.mutedForeground,
              textAlign: "center",
              fontFamily: "Inter_500Medium",
              paddingVertical: 12,
            }}
          >
            Scan not found.
          </Text>
        </Card>
      </ScreenContainer>
    );
  }

  const accent = verdictColor(result.verdict, colors);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Scan result",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
        }}
      />
      <ScreenContainer>
        <Card padding={22} style={{ alignItems: "center" }}>
          <ScoreRing
            score={result.score}
            label={verdictLabel(result.verdict)}
            sublabel={`${result.type.toUpperCase()} scan`}
          />
          <View style={{ height: 14 }} />
          <Text
            style={[styles.query, { color: colors.foreground }]}
            numberOfLines={2}
          >
            {result.query}
          </Text>
          <Text
            style={[styles.date, { color: colors.mutedForeground }]}
          >
            Scanned {new Date(result.scannedAt).toLocaleString()}
          </Text>
        </Card>

        <View>
          <SectionHeader
            title="Threat intelligence"
            subtitle="Verdicts from every source"
          />
          <View style={{ gap: 10 }}>
            {result.sources.map((s, i) => {
              const c = verdictColor(s.verdict, colors);
              return (
                <Card key={i} padding={14}>
                  <View style={styles.sourceRow}>
                    <View
                      style={[
                        styles.sourceIcon,
                        { backgroundColor: c + "22", borderRadius: 12 },
                      ]}
                    >
                      <Feather
                        name={
                          s.verdict === "clean"
                            ? "check"
                            : s.verdict === "malicious"
                              ? "alert-octagon"
                              : s.verdict === "suspicious"
                                ? "alert-triangle"
                                : "help-circle"
                        }
                        size={16}
                        color={c}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.sourceName,
                          { color: colors.foreground },
                        ]}
                      >
                        {s.name}
                      </Text>
                      <Text
                        style={[
                          styles.sourceDetail,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {s.detail}
                      </Text>
                    </View>
                    <Text
                      style={[styles.sourceVerdict, { color: c }]}
                    >
                      {verdictLabel(s.verdict)}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        {Object.keys(result.details).length > 0 ? (
          <View>
            <SectionHeader title="Details" />
            <Card padding={0}>
              {Object.entries(result.details).map(([k, v], i, arr) => (
                <View key={k}>
                  <View style={styles.detailRow}>
                    <Text
                      style={[
                        styles.detailKey,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {k}
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: colors.foreground },
                      ]}
                      numberOfLines={2}
                    >
                      {v}
                    </Text>
                  </View>
                  {i < arr.length - 1 ? (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: colors.border,
                        marginHorizontal: 18,
                      }}
                    />
                  ) : null}
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        <Card padding={16} style={{ borderColor: accent + "55", backgroundColor: accent + "0f" }}>
          <Text style={[styles.advice, { color: colors.foreground }]}>
            {result.verdict === "clean"
              ? "Looks safe. We didn't find this in any malware database, and no suspicious patterns were detected."
              : result.verdict === "suspicious"
                ? "Be cautious. We detected patterns commonly seen in phishing or scam URLs. Don't enter credentials unless you're sure."
                : result.verdict === "malicious"
                  ? "Avoid this resource. It appears in active malware feeds. Do not download anything from it or enter personal info."
                  : "Could not verify. Try again later, or scan a related domain."}
          </Text>
        </Card>

        <PrimaryButton
          title="Scan something else"
          icon="arrow-right"
          variant="secondary"
          onPress={() => router.replace("/(tabs)/scanner")}
        />
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  query: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    textAlign: "center",
    marginTop: 4,
  },
  date: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 4,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sourceIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  sourceName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  sourceDetail: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  sourceVerdict: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 18,
    gap: 14,
    alignItems: "center",
  },
  detailKey: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    flex: 1,
  },
  detailValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    flex: 2,
    textAlign: "right",
  },
  advice: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 19,
  },
});
