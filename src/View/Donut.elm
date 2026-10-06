module View.Donut exposing (Slice, donut, donutWithLegend, total)

{-| SVG donut chart with center label and legend.
-}

import Html exposing (..)
import Html.Attributes as Attr exposing (class, style)
import Svg


type alias Slice =
    { label : String
    , value : Float
    , color : String
    }


total : List Slice -> Float
total slices =
    slices |> List.map .value |> List.sum


donut : List Slice -> Float -> Html msg
donut slices size =
    let
        t =
            total slices

        ( arcs, _ ) =
            List.foldl
                (\s ( acc, startAngle ) ->
                    let
                        sweep =
                            if t == 0 then
                                0

                            else
                                (s.value / t) * 360

                        endAngle =
                            startAngle + sweep
                    in
                    ( arcPath size startAngle endAngle s.color :: acc
                    , endAngle
                    )
                )
                ( [], -90 )
                slices
    in
    Svg.node "svg"
        [ Attr.attribute "viewBox"
            ("0 0 " ++ String.fromFloat size ++ " " ++ String.fromFloat size)
        , Attr.attribute "class" "donut"
        , Attr.attribute "role" "img"
        , Attr.attribute "aria-label" ("Pipeline distribution: " ++ String.join ", " (List.map (\slice -> slice.label ++ " " ++ String.fromFloat slice.value) slices))
        ]
        (List.reverse arcs)


arcPath : Float -> Float -> Float -> String -> Html msg
arcPath size startAngle endAngle color =
    let
        cx =
            size / 2

        cy =
            size / 2

        r =
            (size / 2) - 4

        inner =
            r * 0.62

        toRad a =
            a * pi / 180

        x1 =
            cx + r * cos (toRad startAngle)

        y1 =
            cy + r * sin (toRad startAngle)

        x2 =
            cx + r * cos (toRad endAngle)

        y2 =
            cy + r * sin (toRad endAngle)

        x3 =
            cx + inner * cos (toRad endAngle)

        y3 =
            cy + inner * sin (toRad endAngle)

        x4 =
            cx + inner * cos (toRad startAngle)

        y4 =
            cy + inner * sin (toRad startAngle)

        largeArc =
            if endAngle - startAngle > 180 then
                "1"

            else
                "0"

        path =
            "M "
                ++ String.fromFloat x1
                ++ " "
                ++ String.fromFloat y1
                ++ " A "
                ++ String.fromFloat r
                ++ " "
                ++ String.fromFloat r
                ++ " 0 "
                ++ largeArc
                ++ " 1 "
                ++ String.fromFloat x2
                ++ " "
                ++ String.fromFloat y2
                ++ " L "
                ++ String.fromFloat x3
                ++ " "
                ++ String.fromFloat y3
                ++ " A "
                ++ String.fromFloat inner
                ++ " "
                ++ String.fromFloat inner
                ++ " 0 "
                ++ largeArc
                ++ " 0 "
                ++ String.fromFloat x4
                ++ " "
                ++ String.fromFloat y4
                ++ " Z"
    in
    Svg.node "path"
        [ Attr.attribute "d" path
        , Attr.attribute "fill" color
        ]
        []


legendRow : Float -> Slice -> Html msg
legendRow t s =
    let
        pct =
            if t == 0 then
                0

            else
                (s.value / t) * 100
    in
    div [ class "donut-legend__row" ]
        [ span
            [ class "donut-legend__swatch"
            , style "background" s.color
            ]
            []
        , span [ class "donut-legend__label" ] [ text s.label ]
        , span [ class "donut-legend__value" ]
            [ text (String.fromInt (round s.value)) ]
        , span [ class "donut-legend__pct" ]
            [ text (String.fromInt (round pct) ++ "%") ]
        ]


donutWithLegend : List Slice -> String -> String -> Html msg
donutWithLegend slices centerValue centerLabel =
    let
        t =
            total slices
    in
    div [ class "donut-wrap" ]
        [ div [ class "donut-center-wrap" ]
            [ donut slices 180
            , div [ class "donut-center" ]
                [ span [ class "donut-center__value" ]
                    [ text centerValue ]
                , span [ class "donut-center__label" ]
                    [ text centerLabel ]
                ]
            ]
        , div [ class "donut-legend" ]
            (List.map (legendRow t) slices)
        ]
