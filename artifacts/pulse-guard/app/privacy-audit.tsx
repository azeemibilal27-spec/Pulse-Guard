import { Feather } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { ScoreRing } from "@/components/ScoreRing";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useColors } from "@/hooks/useColors";

type PermItem = {
  permission: string;
  risk: "low" | "medium" | "high";
  why: string;
  advice: string;
  icon: keyof typeof import("@expo/vector-icons").Feather.glyphMap;
};

const PERMISSIONS: PermItem[] = [
  {
    permission: "Location (precise)",
    risk: "high",
    why: "Apps with this permission can track your exact movements at all times.",
    advice: "Switch to 'while using the app' for any non-navigation app.",
    icon: "map-pin",
  },
  {
    permission: "Microphone",
    risk: "high",
    why: "Background access lets an app record audio without your knowledge.",
    advice: "Revoke unless the app is a call/recording/voice tool you actively use.",
    icon: "mic",
  },
  {
    permission: "Camera",
    risk: "high",
    why: "Persistent camera access can be abused for covert capture.",
    advice: "Allow only for camera, social, and video-calling apps.",
    icon: "camera",
  },
  {
    permission: "Contacts",
    risk: "medium",
    why: "Your address book is a juicy target for data brokers.",
    advice: "Only grant to messaging or backup apps you trust.",
    icon: "users",
  },
  {
    permission: "SMS / Call logs",
    risk: "high",
    why: "Apps reading SMS can intercept 2FA codes and conversations.",
    advice: "Almost no app needs this — revoke aggressively.",
    icon: "message-square",
  },
  {
    permission: "Files & media",
    risk: "medium",
    why: "Broad storage access can read documents, photos, and downloaded files.",
    advice: "Prefer 'photos and videos only' over full storage access.",
    icon: "folder",
  },
  {
    permission: "Notifications access",
    risk: "medium",
    why: "Apps with this permission can read every notification (including OTPs).",
    advice: "Reserve for replacement launchers and assistant apps you trust.",
    icon: "bell",
  },
  {
    permission: "Accessibility services",
    risk: "high",
    why: "This is the most dangerous Android permission — it can read everything on screen and act on your behalf.",
    advice: "Only enable for accessibility tools and well-known password managers.",
    icon: "eye",
  },
];

export default function PrivacyAuditScreen() {
  const colors = useColors();

  const score = useMemo(() => {
    let s = 100;
    for (const p of PERMISSIONS) {
      if (p.risk === "high") s -= 6;
      if (p.risk === "medium") s -= 3;
    }
    return Math.max(40, s);
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Privacy Audit",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
        }}
      />
      <ScreenContainer>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Privacy audit
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            High-risk permissions to review across your installed apps.
          </Text>
        </View>

        <Card padding={22} style={{ alignItems: "center" }}>
          <ScoreRing
            score={score}
            label="Privacy posture"
            sublabel="Audit checklist"
          />
        </Card>

        <View>
          <SectionHeader
            title="Permissions checklist"
            subtitle="Open Android Settings → Apps to review each one"
          />
          <View style={{ gap: 10 }}>
            {PERMISSIONS.map((p) => {
              const c =
                p.risk === "high"
                  ? colors.destructive
                  : p.risk === "medium"
                    ? colors.warning
                    : colors.success;
              return (
                <Card key={p.permission} padding={14}>
                  <View style={styles.row}>
                    <View
                      style={[
                        styles.icon,
                        { backgroundColor: c + "22", borderRadius: 12 },
                      ]}
                    >
                      <Feather name={p.icon} size={18} color={c} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.headerRow}>
                        <Text
                          style={[
                            styles.permTitle,
                            { color: colors.foreground },
                          ]}
                        >
                          {p.permission}
                        </Text>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: c + "22",
                              borderRadius: 999,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              { color: c },
                            ]}
                          >
                            {p.risk.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.why,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {p.why}
                      </Text>
                      <Text
                        style={[
                          styles.advice,
                          { color: colors.foreground },
                        ]}
                      >
                        Tip: {p.advice}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  icon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  permTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    flex: 1,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  why: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
  },
  advice: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
  },
});
