error id: file://<WORKSPACE>/alumni-project/src/main/java/com/alumni/Main.java:java/sql/ResultSet#
file://<WORKSPACE>/alumni-project/src/main/java/com/alumni/Main.java
empty definition using pc, found symbol in pc: java/sql/ResultSet#
empty definition using semanticdb
empty definition using fallback
non-local guesses:

offset: 96
uri: file://<WORKSPACE>/alumni-project/src/main/java/com/alumni/Main.java
text:
```scala
package com.alumni;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.@@ResultSet;
import java.sql.Statement;

public class Main {
    public static void main(String[] args) {
        String url = "jdbc:sqlite:alumni.db";

        try (Connection conn = DriverManager.getConnection(url);
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery("SELECT COUNT(*) AS total FROM alumni");

            if (rs.next()) {
                System.out.println("Rows in alumni table: " + rs.getInt("total"));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```


#### Short summary: 

empty definition using pc, found symbol in pc: java/sql/ResultSet#