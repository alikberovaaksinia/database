package com.alumni;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class Main {

    private static final String SQLITE_URL = "jdbc:sqlite:../alumni.db";

    private static final String POSTGRES_URL =
            "jdbc:postgresql://aws-1-eu-west-1.pooler.supabase.com:5432/postgres";
    private static final String POSTGRES_USER = "postgres.zaibfthyhotdlvajjapc";
    private static final String POSTGRES_PASSWORD = "alik123bersh";

    public static void main(String[] args) {

        try {
            // 🔥 принудительно загружаем драйвер
            Class.forName("org.postgresql.Driver");

            try (
                    Connection sqliteConn = DriverManager.getConnection(SQLITE_URL);
                    Connection pgConn = DriverManager.getConnection(
                            POSTGRES_URL, POSTGRES_USER, POSTGRES_PASSWORD
                    );
                    Statement stmt = sqliteConn.createStatement();
                    ResultSet rs = stmt.executeQuery("SELECT * FROM alumni_raw")
            ) {

                String insertSql = """
                    INSERT INTO alumni_raw (
                        db_id,
                        source_id,
                        associate_number,
                        full_name,
                        surname,
                        first_name,
                        middle_name,
                        age_group,
                        phone_number,
                        email,
                        second_email,
                        linkedin,
                        current_firm,
                        current_role,
                        current_role_seniority,
                        current_city,
                        current_country,
                        current_industry,
                        notable_past_firms,
                        past_role_npf,
                        starting_month_npf,
                        ending_month_npf,
                        pr_city,
                        pr_city_2,
                        pr_city_3,
                        pr_country,
                        pr_country_2,
                        pr_country_3,
                        npf_industry,
                        jeme_starting_period,
                        jeme_ending_period,
                        jeme_role,
                        jeme_role_2,
                        jeme_role_3,
                        board,
                        head
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

                PreparedStatement pstmt = pgConn.prepareStatement(insertSql);

                int count = 0;

                while (rs.next()) {

                    for (int i = 1; i <= 36; i++) {
                        pstmt.setObject(i, rs.getObject(i));
                    }

                    pstmt.executeUpdate();
                    count++;
                }

                System.out.println("🔥 Transferred rows: " + count);

            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}