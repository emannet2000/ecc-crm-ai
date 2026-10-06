module View.Format exposing (currencyTotals, dateToDays, dealAgeClass, dealAgeDays, dealAgeLabel, formatCurrency, formatCurrencyWith)

{-| Date arithmetic, deal-age labels and currency formatting.
-}

import Dict
import Html exposing (..)
import Types exposing (..)


daysFromCivil : Int -> Int -> Int -> Int
daysFromCivil y m d =
    let
        y_ =
            if m <= 2 then
                y - 1

            else
                y

        era =
            (if y_ >= 0 then
                y_

             else
                y_ - 399
            )
                // 400

        yoe =
            y_ - era * 400

        doy =
            (153
                * (if m > 2 then
                    m - 3

                   else
                    m + 9
                  )
                + 2
            )
                // 5
                + d
                - 1

        doe =
            yoe * 365 + yoe // 4 - yoe // 100 + doy
    in
    era * 146097 + doe - 719468


dateToDays : String -> Maybe Int
dateToDays dateStr =
    let
        trimmed =
            String.trim dateStr

        parts =
            String.split "-" (String.left 10 trimmed)
    in
    case parts of
        [ yStr, mStr, dStr ] ->
            Maybe.map3 daysFromCivil
                (String.toInt yStr)
                (String.toInt mStr)
                (String.toInt dStr)

        _ ->
            Nothing


dealAgeDays : String -> String -> Maybe Int
dealAgeDays today createdAt =
    Maybe.map2 (\t c -> t - c)
        (dateToDays today)
        (dateToDays createdAt)


dealAgeLabel : Maybe Int -> String
dealAgeLabel maybeDays =
    case maybeDays of
        Nothing ->
            "—"

        Just d ->
            if d <= 0 then
                "new"

            else if d == 1 then
                "1d"

            else if d < 30 then
                String.fromInt d ++ "d"

            else if d < 365 then
                String.fromInt (d // 30) ++ "mo"

            else
                String.fromInt (d // 365) ++ "y"


dealAgeClass : Maybe Int -> String
dealAgeClass maybeDays =
    case maybeDays of
        Just d ->
            if d >= 90 then
                "deal-card__age deal-card__age--critical"

            else if d >= 45 then
                "deal-card__age deal-card__age--stale"

            else
                "deal-card__age"

        Nothing ->
            "deal-card__age"


currencySymbol : String -> String
currencySymbol code =
    case String.toUpper code of
        "USD" ->
            "$"

        "EUR" ->
            "€"

        "GBP" ->
            "£"

        "AED" ->
            "AED "

        "AUD" ->
            "A$"

        "CAD" ->
            "C$"

        "PHP" ->
            "₱"

        "INR" ->
            "₹"

        "SGD" ->
            "S$"

        "JPY" ->
            "¥"

        _ ->
            code ++ " "


formatCurrencyWith : String -> Float -> String
formatCurrencyWith currency v =
    let
        rounded =
            round v

        grouped =
            String.fromInt (abs rounded)
                |> String.reverse
                |> String.toList
                |> List.indexedMap
                    (\i c ->
                        if i /= 0 && modBy 3 i == 0 then
                            [ ',', c ]

                        else
                            [ c ]
                    )
                |> List.concat
                |> List.reverse
                |> String.fromList

        sign =
            if rounded < 0 then
                "-"

            else
                ""
    in
    sign ++ currencySymbol currency ++ grouped


formatCurrency : Float -> String
formatCurrency =
    formatCurrencyWith "USD"


currencyTotals : List ( String, Float ) -> String
currencyTotals items =
    items
        |> List.foldl
            (\( currency, amount ) totals ->
                Dict.update
                    (if currency == "" then
                        "USD"

                     else
                        currency
                    )
                    (\previous -> Just (Maybe.withDefault 0 previous + amount))
                    totals
            )
            Dict.empty
        |> Dict.toList
        |> List.map (\( currency, amount ) -> formatCurrencyWith currency amount)
        |> String.join " · "
