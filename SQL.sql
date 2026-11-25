-- S0 合计
SELECT SUM(count_age_0+count_age_1+count_age_2+count_age_3+count_age_4+count_age_5)
FROM infant_summaries_s0 WHERE year = ?;

-- S1 合计
SELECT SUM(count_age_0+count_age_1+count_age_2+count_age_3+count_age_4+count_age_5)
FROM infant_summaries_s1 WHERE year = ?;

-- S1 里被入力票加过人数的行
SELECT * FROM infant_summaries_s1 WHERE year = ? AND add_fumei_flg = '1';
