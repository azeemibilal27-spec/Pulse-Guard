import { router } from "expo-router";
import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { ToolTile } from "@/components/ToolTile";
import { useSecurity } from "@/context/SecurityContext";
import { useColors } from "@/hooks/useColors";

export default function ToolsScreen() {
  const colors = useColors();
  const { settings, toggleSetting } = useSecurity();

  return (
    <ScreenContainer>
      <View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Security Tools
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Hands-on protection beyond the scanner.
        </Text>
      </View>

      <View style={styles.grid}>
        <ToolTile
          icon="key"
          title="Password Breach"
          description="Check if your password leaked in a data breach"
          tint={colors.primary}
          onPress={() => router.push("/breach-check")}
        />
        <ToolTile
          icon="wifi"
          title="Wi-Fi Safety"
          description="Inspect the network you're connected to"
          tint={colors.accent}
          onPress={() => router.push("/wifi-check")}
        />
      </View>
      <View style={styles.grid}>
        <ToolTile
          icon="eye"
          title="Privacy Audit"
          description="Review high-risk app permissions"
          tint={colors.warning}
          onPress={() => router.push("/privacy-audit")}
        />
        <ToolTile
          icon="info"
          title="About PulseGuard"
          description="Threat feeds, sources, and version info"
          tint={colors.success}
          onPress={() => router.push("/about")}
        />
      </View>

      <View>
        <SectionHeader
          title="Real-time defense"
          subtitle="Always-on protection layers"
        />
        <Card padding={0}>
          <SettingRow
            title="Real-time protection"
            description="Continuous background monitoring"
            value={settings.realTimeProtection}
            onValueChange={() => toggleSetting("realTimeProtection")}
          />
          <Divider />
          <SettingRow
            title="Web shield"
            description="Block known phishing & malware URLs"
            value={settings.webProtection}
            onValueChange={() => toggleSetting("webProtection")}
          />
          <Divider />
          <SettingRow
            title="Wi-Fi alerts"
            description="Warn on unsafe or open networks"
            value={settings.wifiAlerts}
            onValueChange={() => toggleSetting("wifiAlerts")}
          />
          <Divider />
          <SettingRow
            title="App lock"
            description="Require unlock to open PulseGuard"
            value={settings.appLockProtection}
            onValueChange={() => toggleSetting("appLockProtection")}
          />
        </Card>
      </View>
    </ScreenContainer>
  );
}

function SettingRow({
  title,
  description,
  value,
  onValueChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: () => void;
}) {
  const colors = useColors();
  return (
    <View style={settingStyles.row}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={[settingStyles.title, { color: colors.foreground }]}>
          {title}
        </Text>
        <Text
          style={[settingStyles.desc, { color: colors.mutedForeground }]}
        >
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.secondary, true: colors.primary + "88" }}
        thumbColor={value ? colors.primary : colors.mutedForeground}
        ios_backgroundColor={colors.secondary}
      />
    </View>
  );
}

function Divider() {
  const colors = useColors();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 18,
      }}
    />
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
  grid: {
    flexDirection: "row",
    gap: 12,
  },
});

const settingStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 3,
  },
});
