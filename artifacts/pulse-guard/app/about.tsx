import { Feather } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { PulseLogo } from "@/components/PulseLogo";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useColors } from "@/hooks/useColors";

const SOURCES = [
  {
    name: "URLhaus",
    by: "abuse.ch",
    description:
      "Real-time database of malware distribution URLs, refreshed every few minutes.",
    url: "https://urlhaus.abuse.ch",
  },
  {
    name: "MalwareBazaar",
    by: "abuse.ch",
    description:
      "Repository of malware sample hashes used for fingerprint lookups.",
    url: "https://bazaar.abuse.ch",
  },
  {
    name: "Have I Been Pwned",
    by: "Troy Hunt",
    description:
      "Pwned-passwords k-anonymity API used for breach checks. Your password never leaves the device.",
    url: "https://haveibeenpwned.com",
  },
  {
    name: "ipapi.co + ipwho.is",
    by: "Public APIs",
    description:
      "Used for the network-safety probe (geolocation, ISP, proxy detection).",
    url: "https://ipwho.is",
  },
];

export default function AboutScreen() {
  const colors = useColors();
  return (
    <>
      <Stack.Screen
        options={{
          title: "About",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
        }}
      />
      <ScreenContainer>
        <Card padding={22} style={{ alignItems: "center" }}>
          <PulseLogo size={64} />
          <Text style={[styles.brand, { color: colors.foreground }]}>
            PulseGuard
          </Text>
          <Text style={[styles.version, { color: colors.mutedForeground }]}>
            Version 1.0.0 • Cloud security suite
          </Text>
          <Text style={[styles.tag, { color: colors.foreground }]}>
            PulseGuard is a privacy-first mobile security app. All scans are
            backed by open, transparent threat-intelligence feeds — no shady
            black-box engine, no telemetry, no account.
          </Text>
        </Card>

        <View>
          <SectionHeader
            title="Threat-intelligence sources"
            subtitle="Open data feeds powering PulseGuard"
          />
          <View style={{ gap: 10 }}>
            {SOURCES.map((s) => (
              <Pressable
                key={s.name}
                onPress={() => Linking.openURL(s.url)}
                style={({ pressed }) => [
                  styles.source,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.srcName, { color: colors.foreground }]}>
                    {s.name}
                  </Text>
                  <Text
                    style={[styles.srcBy, { color: colors.mutedForeground }]}
                  >
                    by {s.by}
                  </Text>
                  <Text
                    style={[
                      styles.srcDesc,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {s.description}
                  </Text>
                </View>
                <Feather
                  name="external-link"
                  size={18}
                  color={colors.primary}
                />
              </Pressable>
            ))}
          </View>
        </View>

        <Card>
          <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
            PulseGuard is not a replacement for keeping your operating system
            and apps up to date. Always install updates promptly, use a unique
            password for every account, and enable multi-factor authentication
            wherever possible.
          </Text>
        </Card>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  brand: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    marginTop: 12,
    letterSpacing: -0.5,
  },
  version: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 0.4,
  },
  tag: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 16,
    textAlign: "center",
    lineHeight: 19,
  },
  source: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  srcName: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  srcBy: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.4,
  },
  srcDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
  },
  disclaimer: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
});
