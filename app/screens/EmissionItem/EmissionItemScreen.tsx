import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { ScrollView, View } from "react-native";
import { pathOr } from "ramda";
import moment from "moment";
import "moment/min/locales";
import { FormattedNumber } from "react-native-globalize";
import styles from "./EmissionItemScreen.styles";
import { Text, Tag, Button } from "../../components";
import navigationOptions from "./EmissionItemScreen.navigationOptions";
import { calculation, ui, t } from "../../utils";
import { emissions } from "../../ducks";
import { navigate } from "../../navigation";
import { withLocalization, LocalizationContextProps } from "../../utils";

interface Props {
  navigation: {
    state: {
      params: {
        id: string;
      };
    };
  };
}

const EmissionItemScreen = ({
  navigation,
  language = "",
}: Props & LocalizationContextProps) => {
  const emissionId = pathOr(false, ["state", "params", "id"], navigation);
  const dispatch = useDispatch();
  const navigator = navigate(navigation);

  if (!emissionId) {
    navigator.goBack();
    return null;
  }

  const emission = useSelector((state) =>
    emissions.selectors.getEmissionById(state, emissionId)
  );
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onPress = () => {};

  /* Avoid crash right after an emission is deleted */
  if (!emission) {
    navigator.goBack();
    return null;
  }

  const { creationDate = "", emissionModelType = "", name = "" } = emission;

  const date = moment(creationDate, "YYYY-MM-DDTHH:mm:ss.sssZ");
  const day = date.locale(language).format("dddd");
  const monthAndYear = date.locale(language).format("Do MMMM YYYY");
  const co2Emission = calculation.getC02ValueFromEmission(emission);
  const deleteEmission = () =>
    dispatch(emissions.actions.deleteEmissionById(emission.id));

  return (
    <ScrollView style={styles.container}>
      {name.length ? (
        <>
          <Text.H3>{t("EMISSION_ITEM_NAME")}</Text.H3>
          <Text.Primary darkGray style={styles.item}>
            {name}
          </Text.Primary>
        </>
      ) : null}
      <Text.H3>{t("EMISSION_ITEM_TYPE")}</Text.H3>
      <ScrollView horizontal style={styles.item}>
        <Tag
          selected
          onPress={onPress}
          title={ui.getTranslationModelType(emissionModelType)}
        />
      </ScrollView>
      <Text.H3>{t("EMISSION_ITEM_QUANTITY")}</Text.H3>
      <Text.Primary darkGray style={styles.item}>
        <FormattedNumber
          maximumFractionDigits={2}
          value={co2Emission > 1 ? co2Emission : co2Emission * 1000}
        />{" "}
        {co2Emission > 1 ? " kgC02eq" : " gC02eq"}
      </Text.Primary>
      <Text.H3>{t("EMISSION_ITEM_DATE")}</Text.H3>
      <View style={styles.date}>
        <Text.Primary darkGray style={[styles.item, styles.day]}>
          {day + " "}
        </Text.Primary>
        <Text.Primary darkGray style={styles.item}>
          {monthAndYear}
        </Text.Primary>
      </View>
      <Button.Primary fullWidth onPress={deleteEmission} textType={"Primary"}>
        <Text.Primary white>{t("EMISSION_ITEM_DELETE_EMISSION")}</Text.Primary>
      </Button.Primary>
    </ScrollView>
  );
};

EmissionItemScreen.navigationOptions = navigationOptions;

export default withLocalization(EmissionItemScreen);
