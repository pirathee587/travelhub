import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class GenHashes {
    public static void main(String[] args) {
        BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
        System.out.println("hotel2: " + enc.encode("hotel2@123"));
        System.out.println("hotel3: " + enc.encode("hotel3@123"));
        System.out.println("hotel4: " + enc.encode("hotel4@123"));
    }
}
