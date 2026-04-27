import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Card } from "@/components/Card";
import { HistoryRow } from "@/components/HistoryRow";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useSecurity } from "@/context/SecurityContext";
import { useColors } from "@/hooks/useColors";
import { scanInput } from "@/lib/scanner";

const QUICK_SAMPLES = [
  { label: "Google", value: "https://google.com" },
  { label: "Phish sample", value: "http://account-update-secure-login.tk/verify" },
  { label: "8.8.8.8", value: "8.8.8.8" },
];

export default function ScannerScreen() {
  const colors = useColors();
  const { history, addScan } = useSecurity();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (input?: string) => {
    const target = (input ?? value).trim();
    if (!target) return;
    setBusy(true);
    setError(null);
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      const result = await scanInput(target);
      addScan(result);
      router.push({ pathname: "/scan-result", params: { id: result.id } });
      setValue("");
    } catch (_e) {
      setError("Scan failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Threat Scanner
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Check any URL, domain, IP, or file hash against live threat feeds.
        </Text>
      </View>

      <Card padding={16}>
        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="https://example.com or 1.2.3.4"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="search"
            onSubmitEditing={() => submit()}
            style={[
              styles.input,
              {
                color: colors.foreground,
                fontFamily: "Inter_500Medium",
              },
            ]}
            editable={!busy}
          />
          {value ? (
            <Pressable onPress={() => setValue("")}>
              <Feather name="x-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>

        <View style={{ height: 14 }} />
        <PrimaryButton
          title={busy ? "Scanning..." : "Scan now"}
          icon="zap"
          onPress={() => submit()}
          loading={busy}
          disabled={!value.trim()}
        />

        {error ? (
          <Text style={[styles.error, { color: colors.destructive }]}>
            {error}
          </Text>
        ) : null}
      </Card>

      <View>
        <SectionHeader
          title="Try a sample"
          subtitle="Tap any of these to see the scanner in action"
        />
        <View style={styles.samples}>
          {QUICK_SAMPLES.map((s) => (
            <Pressable
              key={s.value}
              onPress={() => submit(s.value)}
              disabled={busy}
              style={({ pressed }) => [
                styles.sample,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: 999,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Feather name="play" size={12} color={colors.primary} />
              <Text
                style={[
                  styles.sampleText,
                  { color: colors.foreground },
                ]}
              >
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Card padding={16}>
        <View style={styles.feedRow}>
          <View style={styles.dot}>
            <View style={[styles.dotInner, { backgroundColor: colors.success }]} />
          </View>
          <Text style={[styles.feedText, { color: colors.foreground }]}>
            Connected to URLhaus & MalwareBazaar
          </Text>
          {busy ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Feather name="check" size={16} color={colors.success} />
          )}
        </View>
      </Card>

      <View>
        <SectionHeader title="Recent scans" />
        {history.length === 0 ? (
          <Card>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                textAlign: "center",
                paddingVertical: 12,
              }}
            >
              Your scan results will appear here.
            </Text>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {history.slice(0, 5).map((item) => (
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
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },
  error: {
    marginTop: 10,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textAlign: "center",
  },
  samples: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sample: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  sampleText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  feedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  feedText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
});
