import { Feather } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import { checkPasswordBreach } from "@/lib/scanner";

type Status =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "safe" }
  | { kind: "pwned"; count: number }
  | { kind: "error"; message: string };

export default function BreachCheckScreen() {
  const colors = useColors();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const run = async () => {
    if (!password) return;
    setStatus({ kind: "checking" });
    try {
      const { pwned, count } = await checkPasswordBreach(password);
      setStatus(pwned ? { kind: "pwned", count } : { kind: "safe" });
    } catch (_e) {
      setStatus({ kind: "error", message: "Lookup failed. Try again." });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Password Breach",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
        }}
      />
      <ScreenContainer>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Has your password leaked?
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            We use the k-anonymity API from Have I Been Pwned. Only the first 5
            characters of the SHA-1 hash leave your device — your password
            itself is never sent.
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
            <Feather name="lock" size={18} color={colors.mutedForeground} />
            <TextInput
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setStatus({ kind: "idle" });
              }}
              placeholder="Enter a password"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!show}
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  fontFamily: "Inter_500Medium",
                },
              ]}
            />
            <Pressable onPress={() => setShow((s) => !s)}>
              <Feather
                name={show ? "eye-off" : "eye"}
                size={18}
                color={colors.mutedForeground}
              />
            </Pressable>
          </View>
          <View style={{ height: 14 }} />
          <PrimaryButton
            title={status.kind === "checking" ? "Checking..." : "Check now"}
            icon="search"
            onPress={run}
            loading={status.kind === "checking"}
            disabled={!password}
          />
        </Card>

        {status.kind === "safe" ? (
          <Card style={{ borderColor: colors.success + "66" }}>
            <View style={styles.resultRow}>
              <Feather name="check-circle" size={28} color={colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.resultTitle, { color: colors.success }]}>
                  Not found in any known breach
                </Text>
                <Text
                  style={[
                    styles.resultDesc,
                    { color: colors.mutedForeground },
                  ]}
                >
                  This password hasn't appeared in public data breaches we
                  track. Still, use a unique password for every account.
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        {status.kind === "pwned" ? (
          <Card style={{ borderColor: colors.destructive + "66" }}>
            <View style={styles.resultRow}>
              <Feather name="alert-octagon" size={28} color={colors.destructive} />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.resultTitle, { color: colors.destructive }]}
                >
                  Compromised — seen {status.count.toLocaleString()} times
                </Text>
                <Text
                  style={[
                    styles.resultDesc,
                    { color: colors.mutedForeground },
                  ]}
                >
                  This password has been exposed in known data breaches. Stop
                  using it on every site immediately and switch to a unique
                  password (a password manager helps).
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        {status.kind === "error" ? (
          <Card style={{ borderColor: colors.destructive + "55" }}>
            <Text
              style={{
                color: colors.destructive,
                fontFamily: "Inter_500Medium",
                textAlign: "center",
              }}
            >
              {status.message}
            </Text>
          </Card>
        ) : null}
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
    marginTop: 6,
    lineHeight: 19,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  resultTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  resultDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
});
