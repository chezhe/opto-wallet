import { useRoute } from "@react-navigation/native";
import Box from "components/common/Box";
import Heading from "components/common/Heading";
import ScreenHeader from "components/common/ScreenHeader";
import { Text, View } from "components/Themed";
import useColorScheme from "hooks/useColorScheme";
import { i18n } from "locale";
import { KeyAltPlus, Wallet } from "iconoir-react-native";
import { useEffect } from "react";
import {
  BackHandler,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppSelector } from "store/hooks";
import Colors from "theme/Colors";
import Styles, { ICON_WRAP_SIZE } from "theme/Styles";
import { Chain, RootStackScreenProps } from "types";
import icons from "utils/icons";

export default function Start({ navigation }: RootStackScreenProps<"Start">) {
  const { params } = useRoute();
  const isNew = (params as any).new as boolean;
  const chain = (params as any).chain as Chain;

  const wallet = useAppSelector((state) => state.wallet.current);
  const insets = useSafeAreaInsets();
  const theme = useColorScheme();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (isNew && wallet) {
      navigation.goBack();
    }
  }, [wallet]);

  useEffect(() => {
    if (isNew) {
      const unsub = BackHandler.addEventListener("hardwareBackPress", () => {
        return false;
      });

      return () => unsub && unsub.remove();
    }
  }, [isNew]);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: isNew ? insets.top : 0,
        backgroundColor: Colors[theme].background,
      }}
    >
      {!isNew && <ScreenHeader title={i18n.t("Back")} />}
      <ImageBackground
        source={icons.BOTTOM_LOGO}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <Heading>{i18n.t("Welcome to")}</Heading>
          <Heading>Opto Wallet</Heading>

          <Box
            direction="column"
            backgroundColor={Colors.e3}
            style={{
              marginTop: 120,
              borderRadius: 10,
            }}
          >
            <Pressable
              style={{ width: "100%" }}
              onPress={() =>
                navigation.navigate("Create", {
                  chain,
                  new: isNew,
                })
              }
            >
              <Box gap="medium" pad="medium">
                <View
                  style={[Styles.iconWrap, { backgroundColor: Colors.green }]}
                >
                  <Wallet
                    width={ICON_WRAP_SIZE * 0.6}
                    height={ICON_WRAP_SIZE * 0.6}
                    color={Colors.white}
                  />
                </View>
                <View>
                  <Heading level={3} style={{ color: Colors.link }}>
                    {i18n.t("Create")}
                  </Heading>
                  <Text style={styles.subtitle}>
                    {i18n.t("I want to create a new wallet")}
                  </Text>
                </View>
              </Box>
            </Pressable>

            <View
              style={{
                height: 1,
                width: width - 40,
                backgroundColor: Colors.sun,
              }}
            />

            <Pressable
              style={{ width: "100%" }}
              onPress={() =>
                navigation.navigate("Restore", { new: isNew, chain })
              }
            >
              <Box gap="medium" pad="medium">
                <View
                  style={[Styles.iconWrap, { backgroundColor: Colors.purple }]}
                >
                  <KeyAltPlus
                    width={ICON_WRAP_SIZE * 0.6}
                    height={ICON_WRAP_SIZE * 0.6}
                    color={Colors.white}
                  />
                </View>
                <View>
                  <Heading level={3} style={{ color: Colors.link }}>
                    {i18n.t("Restore")}
                  </Heading>
                  <Text style={styles.subtitle}>
                    {i18n.t("I have mnemonic or private key")}
                  </Text>
                </View>
              </Box>
            </Pressable>
          </Box>

          {!isNew && chain === Chain.NEAR && (
            <Pressable
              style={{ marginTop: 50 }}
              onPress={() => {
                navigation.navigate("ConnectLedger");
              }}
            >
              <Box
                direction="row"
                align="center"
                justify="center"
                gap="medium"
                backgroundColor={Colors.e3}
                pad="medium"
                full
                style={{ borderRadius: 10 }}
              >
                <Text style={{ color: Colors.black, fontSize: 20 }}>
                  {i18n.t("Connect")}
                </Text>
                <Image source={icons.LEDGER} style={styles.ledger} />
              </Box>
            </Pressable>
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: Colors.gray,
  },
  ledger: {
    height: 30,
    width: 90,
  },
});
